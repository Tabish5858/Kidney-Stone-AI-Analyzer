# Backend - Kidney Stone Detection API

Flask backend server for kidney stone-focused CT image detection.

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

3. Run the server (development):

```bash
python app.py
```

The server will start on `http://localhost:5000`

4. Production-style run (recommended for demos):

```bash
gunicorn --workers 2 --threads 4 --timeout 120 --bind 0.0.0.0:5000 wsgi:app
```

## Health Check

```bash
curl http://localhost:5000/health
```

## Readiness Check

```bash
curl http://localhost:5000/ready
```

## Environment Variables

- `PORT` (default: `5000`)
- `FLASK_DEBUG` (default: `false`)
- `CORS_ORIGINS` comma-separated origin allowlist.
  - Default includes `http://localhost:8080`, `http://127.0.0.1:8080`, `http://localhost:5173`, and `http://127.0.0.1:5173`.
- `STONE_CLASS_LABEL` (default: `stone`) to identify which class index maps to stone.
- `STONE_THRESHOLD` (default: `0.5`) to control stone-detected vs non-stone decision boundary.

## Prediction Response Contract

`POST /predict` returns a stone-focused payload:

- `prediction_label`: `stone` or `non-stone`
- `stone_detected`: boolean decision
- `stone_probability`: model probability for the stone class
- `decision_threshold`: threshold used for decisioning
- `top_class_label`: top class from the full model output (for transparency)
- `top_class_confidence`: confidence for top class

## Model Training

The backend includes a production-focused training script that supports:

- Stratified train/validation split by class.
- Class weighting for imbalance.
- Two-stage transfer learning (head training + fine-tuning).
- Metrics and artifact export (`training_metrics.json`, `training_history.png`, `class_labels.json`).

### Train with Existing Classification Data

```bash
python train_model.py --epochs 25 --fine-tune-epochs 8
```

### Use Kaggle Kidney-Stone Detection Dataset (Bounding Boxes)

The Kaggle dataset you shared is object-detection oriented (YOLO labels + boxes), so this repo provides a conversion pipeline that extracts stone ROIs as additional stone training samples.

1. Configure Kaggle API credentials:

```bash
mkdir -p ~/.kaggle
cp /path/to/kaggle.json ~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json
```

2. Download + extract stone crops:

```bash
python prepare_kaggle_stone_dataset.py --overwrite-output
```

3. Train with the extra stone crops:

```bash
python train_model.py --extra-stone-dir ./datasets/stone_crops --epochs 25 --fine-tune-epochs 8
```

4. Optional data-only validation (no training):

```bash
python train_model.py --extra-stone-dir ./datasets/stone_crops --dry-run
```

## Training Outputs

- `kidney_stone_cnn_model.h5`: trained model used by `app.py`
- `class_labels.json`: index-to-class mapping
- `training_metrics.json`: epoch metrics and best validation scores
- `training_history.png`: accuracy/loss curves

## Files

- `app.py` - Main Flask application
- `wsgi.py` - WSGI entrypoint for production servers like Gunicorn
- `train_model.py` - Script to train the classifier model
- `prepare_kaggle_stone_dataset.py` - Downloads Kaggle detection data and extracts stone crops
- `kidney_stone_cnn_model.h5` - Pre-trained model file
- `class_labels.json` - Class labels for predictions
- `samples/` - Sample images for testing
- `training_history.png` - Training history visualization
