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

model = tf.keras.models.load_model(MODEL_PATH)
with LABELS_PATH.open("r", encoding="utf-8") as f:
    labels = json.load(f)

IMAGE_SIZE = (128, 128)


def prepare_image(image_file):
    img = Image.open(image_file).convert("RGB")
    img = img.resize(IMAGE_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array / 255.0


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename is None or file.filename.strip() == "":
        return jsonify({"error": "Empty filename"}), 400

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
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 500


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
