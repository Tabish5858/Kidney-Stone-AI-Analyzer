# Kidney Stone AI - Run Guide For Other Machines

This guide explains exactly how to run the project on a new machine.

## 1. Prerequisites

Install these first:

- Python 3.10+ (recommended: 3.11 or 3.12)
- Node.js 18+ and npm
- Git

Optional for production-style backend serving:

- `gunicorn` (already included in `backend/requirements.txt`)

## 2. Clone The Repository

```bash
git clone <YOUR_REPO_URL>
cd Kidney-Stone-detection-using-AiML
```

## 3. Backend Setup

### 3.1 Create and activate virtual environment

Mac/Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3.2 Install backend dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.3 Confirm model artifacts exist

Required files:

- `backend/kidney_stone_cnn_model.h5`
- `backend/class_labels.json`

If they are missing, copy them from your trained artifacts or retrain.

### 3.4 Run backend (development)

```bash
python app.py
```

Backend should run at:

- `http://127.0.0.1:5000`

### 3.5 (Optional) Run backend in production-style mode

From `backend/` directory:

```bash
gunicorn --workers 2 --threads 4 --timeout 120 --bind 0.0.0.0:5000 wsgi:app
```

## 4. Backend Health And Prediction Test (Terminal)

Open a second terminal and run:

```bash
curl http://127.0.0.1:5000/health
curl http://127.0.0.1:5000/ready
```

Expected:

- `/health` returns `{"status":"ok"}`
- `/ready` returns status `ready`

Test prediction with a sample image:

```bash
curl -X POST -F "file=@backend/samples/stone/Stone- (1).jpg" http://127.0.0.1:5000/predict
```

You should receive JSON containing fields like:

- `prediction_label`
- `stone_detected`
- `stone_probability`
- `decision_threshold`

## 5. Frontend Setup

Open another terminal in repo root:

```bash
cd frontend
npm install
```

Create local env file:

```bash
echo "VITE_API_BASE_URL=http://127.0.0.1:5000" > .env.local
```

Run frontend:

```bash
npm run dev
```

Frontend should run at:

- `http://127.0.0.1:5173`

## 6. Frontend Functional Test

1. Open `http://127.0.0.1:5173/analyzer`
2. Click **Choose File**
3. Upload a sample image (for example from `backend/samples/stone/`)
4. Click **Run stone detection**
5. Verify result panel shows:
   - Stone Detection (Stone detected / No stone detected)
   - Stone Probability
   - Decision Threshold
   - Top Model Class

## 7. Common Environment Variables

Backend supports:

- `PORT` (default `5000`)
- `CORS_ORIGINS` (comma-separated allowed origins)
- `STONE_THRESHOLD` (default `0.5`)
- `STONE_CLASS_LABEL` (default `stone`)

Example:

```bash
export STONE_THRESHOLD=0.55
export CORS_ORIGINS="http://127.0.0.1:5173"
```

## 8. Troubleshooting

### Port already in use

Check and stop conflicting process.

Mac/Linux example:

```bash
lsof -i tcp:5000
lsof -i tcp:5173
```

### Frontend cannot reach backend

- Ensure backend is running on port 5000
- Check `frontend/.env.local` value
- Restart frontend after changing env file

### Model loading error

- Verify model and labels files are present in `backend/`
- Reinstall backend dependencies in virtual environment

## 9. Quick Start (One-Page Summary)

Terminal A:

```bash
cd backend
source .venv/bin/activate
python app.py
```

Terminal B:

```bash
cd frontend
npm install
npm run dev
```

Terminal C:

```bash
curl http://127.0.0.1:5000/health
curl -X POST -F "file=@backend/samples/stone/Stone- (1).jpg" http://127.0.0.1:5000/predict
```

Then open:

- `http://127.0.0.1:5173/analyzer`
