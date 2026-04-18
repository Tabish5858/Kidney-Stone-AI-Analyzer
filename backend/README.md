# Backend - Kidney Stone AI Analyzer

Flask backend server for the kidney stone classification AI model.

## Setup

1. Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Mac/Linux
# or
venv\Scripts\activate     # On Windows
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
python app.py
```

The server will start on `http://localhost:5000`

## Health Check

```bash
curl http://localhost:5000/health
```

## Environment Variables

- `PORT` (default: `5000`)
- `FLASK_DEBUG` (default: `false`)
- `CORS_ORIGINS` comma-separated origin allowlist.
  - Default includes `http://localhost:8080`, `http://127.0.0.1:8080`, `http://localhost:5173`, and `http://127.0.0.1:5173`.

## Files

- `app.py` - Main Flask application
- `train_model.py` - Script to train the CNN model
- `kidney_stone_cnn_model.h5` - Pre-trained model file
- `class_labels.json` - Class labels for predictions
- `samples/` - Sample images for testing
- `training_history.png` - Training history visualization
