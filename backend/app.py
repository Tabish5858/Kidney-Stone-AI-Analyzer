import json
import os
from pathlib import Path

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, ImageOps, UnidentifiedImageError

from stone_measurement import estimate_stone_measurement

app = Flask(__name__)

default_origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
cors_origins = os.getenv("CORS_ORIGINS", ",".join(default_origins))
allowed_origins = [
    origin.strip() for origin in cors_origins.split(",") if origin.strip()
]
CORS(app, resources={r"/*": {"origins": allowed_origins}})

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "kidney_stone_cnn_model.h5"
LABELS_PATH = BASE_DIR / "class_labels.json"
STONE_CLASS_LABEL = os.getenv("STONE_CLASS_LABEL", "stone").strip().lower()


def load_inference_model(model_path: Path) -> tf.keras.Model:
    try:
        return tf.keras.models.load_model(model_path, compile=False)
    except ValueError as exc:
        message = str(exc)
        if "Unknown layer" not in message or (
            "TrueDivide" not in message and "Subtract" not in message
        ):
            raise

        # Compatibility shim for H5 models serialized with tf op layers.
        from keras.src.ops.numpy import Subtract, TrueDivide

        return tf.keras.models.load_model(
            model_path,
            compile=False,
            custom_objects={"TrueDivide": TrueDivide, "Subtract": Subtract},
        )


def parse_probability_threshold(value: str | None, default_value: float = 0.5) -> float:
    if value is None:
        return default_value

    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default_value

    if parsed < 0.0 or parsed > 1.0:
        return default_value

    return parsed


def find_stone_label_index(label_map: dict[str, str], stone_label: str) -> int:
    for index_text, class_name in label_map.items():
        if str(class_name).strip().lower() != stone_label:
            continue

        try:
            return int(index_text)
        except (TypeError, ValueError):
            break

    raise RuntimeError(
        f"Stone label '{stone_label}' was not found in class labels: {label_map}"
    )


def error_response(message: str, status_code: int):
    return jsonify({"error": message}), status_code


def parse_optional_positive_float(value: str | None) -> float | None:
    if value is None:
        return None

    raw_value = value.strip()
    if raw_value == "":
        return None

    try:
        parsed = float(raw_value)
    except (TypeError, ValueError):
        return None

    if parsed <= 0:
        return None

    return parsed


model = load_inference_model(MODEL_PATH)
with LABELS_PATH.open("r", encoding="utf-8") as f:
    labels = json.load(f)

STONE_LABEL_INDEX = find_stone_label_index(labels, STONE_CLASS_LABEL)
STONE_THRESHOLD = parse_probability_threshold(os.getenv("STONE_THRESHOLD"), 0.5)


def infer_model_image_size(
    default_size: tuple[int, int] = (128, 128)
) -> tuple[int, int]:
    input_shape = model.input_shape
    if isinstance(input_shape, list):
        input_shape = input_shape[0]

    if (
        isinstance(input_shape, tuple)
        and len(input_shape) >= 3
        and input_shape[1] is not None
        and input_shape[2] is not None
    ):
        return int(input_shape[1]), int(input_shape[2])

    return default_size


IMAGE_SIZE = infer_model_image_size()
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def warmup_inference_model() -> bool:
    warmup_tensor = np.zeros((1, IMAGE_SIZE[0], IMAGE_SIZE[1], 3), dtype=np.float32)
    _ = model.predict(warmup_tensor, verbose=0)
    return True


try:
    MODEL_READY = warmup_inference_model()
except Exception:
    app.logger.exception("Model warmup failed during startup")
    MODEL_READY = False


def load_uploaded_image(image_file) -> Image.Image:
    image_file.stream.seek(0)
    with Image.open(image_file.stream) as raw_image:
        image = ImageOps.exif_transpose(raw_image).convert("RGB")

    image_file.stream.seek(0)
    return image


def prepare_image_for_model(image: Image.Image):
    model_image = image.resize(IMAGE_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(model_image)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array.astype(np.float32)


def is_allowed_file(filename: str) -> bool:
    extension = Path(filename).suffix.lower()
    return extension in ALLOWED_IMAGE_EXTENSIONS


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


@app.route("/ready", methods=["GET"])
def readiness_check():
    payload = {
        "status": "ready" if MODEL_READY else "not_ready",
        "stone_threshold": STONE_THRESHOLD,
        "stone_class_label": STONE_CLASS_LABEL,
        "model_input_size": {"width": IMAGE_SIZE[0], "height": IMAGE_SIZE[1]},
    }
    return jsonify(payload), 200 if MODEL_READY else 503


@app.route("/predict", methods=["POST"])
def predict():
    if not MODEL_READY:
        return error_response("Model is not ready to serve predictions.", 503)

    if request.content_length and request.content_length > MAX_UPLOAD_BYTES:
        return error_response("File too large. Maximum allowed size is 10MB.", 413)

    if "file" not in request.files:
        return error_response("No file part", 400)

    file = request.files["file"]

    if file.filename is None or file.filename.strip() == "":
        return error_response("Empty filename", 400)

    if not is_allowed_file(file.filename):
        return error_response("Unsupported file type", 400)

    try:
        source_image = load_uploaded_image(file)
        prepared_image = prepare_image_for_model(source_image)
    except (UnidentifiedImageError, OSError):
        return error_response("Invalid or corrupted image file", 400)
    except Exception:
        app.logger.exception("Image preparation failed")
        return error_response("Failed to process the uploaded image", 400)

    pixel_spacing_mm = parse_optional_positive_float(
        request.form.get("pixel_spacing_mm")
    )

    try:
        # Make prediction
        predictions = model.predict(prepared_image, verbose=0)
        probabilities = predictions[0]

        if STONE_LABEL_INDEX >= len(probabilities):
            raise ValueError("Stone class index is out of model output range")

        stone_probability = float(probabilities[STONE_LABEL_INDEX])
        stone_detected = stone_probability >= STONE_THRESHOLD

        stone_measurement = {
            "available": False,
            "method": "intensity_component_v1",
            "reason": "stone_not_detected",
        }

        if stone_detected:
            try:
                stone_measurement = estimate_stone_measurement(
                    source_image,
                    pixel_spacing_mm=pixel_spacing_mm,
                )
            except Exception:
                app.logger.exception("Stone measurement failed")
                stone_measurement = {
                    "available": False,
                    "method": "intensity_component_v1",
                    "reason": "measurement_pipeline_failed",
                }

        top_index = int(np.argmax(probabilities))
        top_confidence = float(probabilities[top_index])

        top_label = labels.get(str(top_index), "unknown")

        return jsonify(
            {
                "prediction_label": "stone" if stone_detected else "non-stone",
                "stone_detected": stone_detected,
                "stone_probability": stone_probability,
                "confidence": f"{stone_probability:.2f}",
                "decision_threshold": STONE_THRESHOLD,
                "top_class_label": top_label,
                "top_class_confidence": top_confidence,
                "stone_measurement": stone_measurement,
            }
        )
    except Exception:
        app.logger.exception("Prediction failed for uploaded image")
        return error_response("Prediction failed for the uploaded image", 500)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
