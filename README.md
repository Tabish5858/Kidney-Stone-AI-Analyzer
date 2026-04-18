# Kidney Stone AI Analyzer

A full-stack AI-powered web application for kidney stone detection from CT scan images.

## Features

- Upload and analyze kidney CT scan images
- Stone-focused API decisioning (`stone` vs `non-stone`)
- Deep learning model (MobileNetV2 transfer learning)
- Real API-backed predictions with confidence scores
- Kaggle dataset integration pipeline for stone ROI augmentation
- Modern, responsive UI

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js & npm (for frontend)

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Create a virtual environment and activate it:

   ```
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Run the backend server:

   ```
   python app.py
   ```

   Production-style run for demos:

   ```
   gunicorn --workers 2 --threads 4 --timeout 120 --bind 0.0.0.0:5000 wsgi:app
   ```

5. Verify backend health:
   ```
   curl http://localhost:5000/health
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the frontend:

   ```
   npm run dev
   ```

4. Optionally configure API URL with a frontend environment file:

   ```
   echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local
   ```

5. Open your browser at [http://localhost:8080](http://localhost:8080)

## Project Structure

```
kidney-stone-analyzer/
├── backend/
│   ├── app.py                    # Flask backend server
│   ├── train_model.py           # Model training script
│   ├── kidney_stone_cnn_model.h5 # Trained model file
│   ├── class_labels.json       # Class labels for predictions
│   ├── requirements.txt        # Python dependencies
│   └── samples/                # Sample images for testing
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   └── pages/             # React pages
│   ├── package.json           # Node.js dependencies
│   └── ...                    # Other frontend config files
├── README.md
└── LICENSE
```

## Dataset

The `data/` directory contains ~12,000 CT scan images organized by class:

- **Cyst**: 3,709 images
- **Normal**: 5,077 images
- **Stone**: 1,377 images
- **Tumor**: 2,283 images

The serving API is now stone-focused: model output is converted into `stone_detected` and `stone_probability` for deployment simplicity.

**Note:** The whole dataset is excluded from the Git repository due to its large size (~GB). If you need to download the Dataset completly then See `data/README.md` for more details.

## Improve Stone Detection with the Kaggle Dataset You Shared

This repository can use the Kaggle kidney-stone object-detection dataset you provided:

- https://www.kaggle.com/datasets/safurahajiheidari/kidney-stone-images/data
- https://www.kaggle.com/datasets/safurahajiheidari/kidney-stone-images/code

Because that dataset uses bounding boxes, the backend includes a conversion script that extracts stone crops and feeds them into classifier training.

```bash
cd backend
python prepare_kaggle_stone_dataset.py --overwrite-output
python train_model.py --extra-stone-dir ./datasets/stone_crops --epochs 25 --fine-tune-epochs 8
```

Then restart the backend so `app.py` loads the newly trained `kidney_stone_cnn_model.h5`.

## Important Quality Note

No medical AI model can be guaranteed to be perfect. To move toward near-production quality, you should validate on independent clinical data, monitor false negatives for stone cases, and review confusion matrices and calibration before deployment.

## License

[MIT](LICENSE)

## Screenshots

<img width="1908" height="968" alt="Screenshot 2025-07-19 193125" src="https://github.com/user-attachments/assets/07f9a8a9-8d0b-4701-b338-33bde8c40455" />
<img width="1905" height="959" alt="Screenshot 2025-07-19 193156" src="https://github.com/user-attachments/assets/a552cfd1-a3f4-4b61-a44b-1e2d8d8cc7de" />

<img width="1903" height="947" alt="Screenshot 2025-07-19 193441" src="https://github.com/user-attachments/assets/9f5569fa-8f12-46e4-a03b-4b56870e675c" />
<img width="1877" height="955" alt="Screenshot 2025-07-19 193535" src="https://github.com/user-attachments/assets/08328f07-a8e3-4b98-9014-9225ae6282c2" />

# Kidney-Stone-AI-Analyzer
