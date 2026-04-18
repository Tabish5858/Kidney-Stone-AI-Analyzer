import json
import os
from pathlib import Path

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

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


model = load_inference_model(MODEL_PATH)
with LABELS_PATH.open("r", encoding="utf-8") as f:
    labels = json.load(f)


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


def prepare_image(image_file):
    img = Image.open(image_file).convert("RGB")
    img = img.resize(IMAGE_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array.astype(np.float32)


def is_allowed_file(filename: str) -> bool:
    extension = Path(filename).suffix.lower()
    return extension in ALLOWED_IMAGE_EXTENSIONS


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    if request.content_length and request.content_length > MAX_UPLOAD_BYTES:
        return jsonify({"error": "File too large. Maximum allowed size is 10MB."}), 413

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename is None or file.filename.strip() == "":
        return jsonify({"error": "Empty filename"}), 400

    if not is_allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    try:
        prepared_image = prepare_image(file)

        # Make prediction
        predictions = model.predict(prepared_image, verbose=0)

        # Get the class with the highest probability
        predicted_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_index])

        # Map index to label name
        predicted_label = labels.get(str(predicted_index), "Unknown")

        return jsonify(
            {"prediction_label": predicted_label, "confidence": f"{confidence:.2f}"}
        )
    except Exception:
        app.logger.exception("Prediction failed for uploaded image")
        return jsonify({"error": "Prediction failed for the uploaded image"}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")
    # Hardcoded credentials
    if username == "admin" and password == "password123":
        return jsonify({"success": True, "message": "Login successful"})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
