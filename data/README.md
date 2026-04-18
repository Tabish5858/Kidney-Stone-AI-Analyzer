# Dataset - Kidney Stone CT Scan Images

This directory contains the training dataset for the kidney stone classification model.

## Dataset Structure

```
data/
├── cyst/          # Kidney cyst images
├── normal/        # Normal kidney images
├── stone/         # Kidney stone images
└── tumor/         # Kidney tumor images
```

## Dataset Information

- **Total Images**: ~12,000+ CT scan images
- **Image Format**: JPG
- **Classes**: 4 (Cyst, Normal, Stone, Tumor)
- **Primary Source**: Medical CT classification dataset
- **Optional Augmentation Source**: Kaggle stone object-detection dataset

## Usage

This dataset is used by:

- `backend/train_model.py` - For training the CNN model
- `backend/app.py` - For loading class labels and model predictions

Optional pipeline:

- `backend/prepare_kaggle_stone_dataset.py` - Converts Kaggle YOLO bounding boxes into additional stone crops

## Note

Due to the large size of this dataset (~GB), it is excluded from the Git repository by default.

If you need complete data for training and predictions, use:

- Classification dataset: https://www.kaggle.com/datasets/nazmul0087/ct-kidney-dataset-normal-cyst-tumor-and-stone
- Stone detection dataset (bounding boxes): https://www.kaggle.com/datasets/safurahajiheidari/kidney-stone-images

After downloading the bounding-box dataset, run:

```bash
cd backend
python prepare_kaggle_stone_dataset.py --overwrite-output
python train_model.py --extra-stone-dir ./datasets/stone_crops
```

## Dataset Statistics

- **Cyst**: 3,709 images
- **Normal**: 5,077 images
- **Stone**: 1,377 images
- **Tumor**: 2,283 images
