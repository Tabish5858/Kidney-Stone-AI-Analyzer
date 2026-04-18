import argparse
import json
import random
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras import layers
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

CLASS_NAMES = ("cyst", "normal", "stone", "tumor")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def parse_args() -> argparse.Namespace:
    backend_dir = Path(__file__).resolve().parent
    repo_root = backend_dir.parent

    parser = argparse.ArgumentParser(
        description="Train a kidney CT multi-class classifier with optional Kaggle stone-crop augmentation."
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=repo_root / "data",
        help="Directory containing class folders: cyst, normal, stone, tumor.",
    )
    parser.add_argument(
        "--extra-stone-dir",
        type=Path,
        default=None,
        help="Optional directory of extra stone-only crops (for example from Kaggle YOLO labels).",
    )
    parser.add_argument(
        "--image-size",
        type=int,
        default=224,
        help="Input image size used for model training.",
    )
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument(
        "--fine-tune-epochs",
        type=int,
        default=8,
        help="Extra epochs after unfreezing part of the backbone.",
    )
    parser.add_argument(
        "--fine-tune-layers",
        type=int,
        default=40,
        help="Number of top MobileNetV2 layers to unfreeze during fine-tuning.",
    )
    parser.add_argument("--learning-rate", type=float, default=1e-4)
    parser.add_argument("--fine-tune-learning-rate", type=float, default=1e-5)
    parser.add_argument("--val-split", type=float, default=0.2)
    parser.add_argument("--dropout", type=float, default=0.35)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--model-out",
        type=Path,
        default=backend_dir / "kidney_stone_cnn_model.h5",
    )
    parser.add_argument(
        "--labels-out",
        type=Path,
        default=backend_dir / "class_labels.json",
    )
    parser.add_argument(
        "--metrics-out",
        type=Path,
        default=backend_dir / "training_metrics.json",
    )
    parser.add_argument(
        "--plot-out",
        type=Path,
        default=backend_dir / "training_history.png",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate data loading and label generation without running training.",
    )
    return parser.parse_args()


def set_global_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    tf.keras.utils.set_random_seed(seed)


def list_images(directory: Path) -> list[Path]:
    if not directory.exists():
        return []
    return sorted(
        [
            path
            for path in directory.rglob("*")
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ]
    )


def resolve_class_directory(data_dir: Path, class_name: str) -> Path:
    candidates = [
        data_dir / class_name,
        data_dir / class_name.capitalize(),
        data_dir / class_name.upper(),
    ]

    for candidate in candidates:
        if candidate.exists() and candidate.is_dir():
            return candidate

    # Default to lowercase target if no directory is found.
    return data_dir / class_name


def build_class_file_index(
    data_dir: Path, extra_stone_dir: Path | None
) -> dict[str, list[Path]]:
    class_files: dict[str, list[Path]] = {}

    for class_name in CLASS_NAMES:
        class_dir = resolve_class_directory(data_dir, class_name)
        files = list_images(class_dir)
        if class_name == "stone" and extra_stone_dir and extra_stone_dir.exists():
            files.extend(list_images(extra_stone_dir))

        # Remove duplicates while preserving deterministic order.
        unique_files = sorted({path.resolve() for path in files})
        if not unique_files:
            raise ValueError(
                f"No images found for class '{class_name}' under {data_dir}."
            )

        class_files[class_name] = unique_files

    return class_files


def stratified_split(
    class_files: dict[str, list[Path]],
    val_split: float,
    seed: int,
) -> tuple[list[Path], list[int], list[Path], list[int]]:
    if val_split <= 0 or val_split >= 0.5:
        raise ValueError("val-split must be > 0 and < 0.5")

    rng = np.random.default_rng(seed)
    train_paths: list[Path] = []
    train_labels: list[int] = []
    val_paths: list[Path] = []
    val_labels: list[int] = []

    for class_index, class_name in enumerate(CLASS_NAMES):
        class_items = list(class_files[class_name])
        rng.shuffle(class_items)

        val_count = max(1, int(len(class_items) * val_split))
        if len(class_items) - val_count < 1:
            val_count = len(class_items) - 1

        if val_count <= 0:
            raise ValueError(
                f"Not enough data in class '{class_name}' to create train/validation split."
            )

        class_val = class_items[:val_count]
        class_train = class_items[val_count:]

        train_paths.extend(class_train)
        train_labels.extend([class_index] * len(class_train))

        val_paths.extend(class_val)
        val_labels.extend([class_index] * len(class_val))

    return train_paths, train_labels, val_paths, val_labels


def decode_and_resize(
    image_path: tf.Tensor, label: tf.Tensor, image_size: int
) -> tuple[tf.Tensor, tf.Tensor]:
    image_bytes = tf.io.read_file(image_path)
    image = tf.image.decode_image(image_bytes, channels=3, expand_animations=False)
    image = tf.image.resize(
        image, [image_size, image_size], method=tf.image.ResizeMethod.BILINEAR
    )
    image = tf.cast(image, tf.float32)
    return image, label


def make_dataset(
    paths: list[Path],
    labels: list[int],
    image_size: int,
    batch_size: int,
    training: bool,
    seed: int,
) -> tf.data.Dataset:
    path_tensor = tf.constant([str(path) for path in paths])
    label_tensor = tf.constant(labels, dtype=tf.int32)

    dataset = tf.data.Dataset.from_tensor_slices((path_tensor, label_tensor))
    if training:
        dataset = dataset.shuffle(
            buffer_size=len(paths),
            seed=seed,
            reshuffle_each_iteration=True,
        )

    dataset = dataset.map(
        lambda path, label: decode_and_resize(path, label, image_size),
        num_parallel_calls=tf.data.AUTOTUNE,
    )
    dataset = dataset.batch(batch_size)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    return dataset


def make_model(
    image_size: int, num_classes: int, dropout: float
) -> tuple[tf.keras.Model, tf.keras.Model]:
    augmentation = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.08),
            layers.RandomZoom(0.12),
            layers.RandomContrast(0.08),
        ],
        name="augmentation",
    )

    base_model = tf.keras.applications.MobileNetV2(
        include_top=False,
        weights="imagenet",
        input_shape=(image_size, image_size, 3),
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(image_size, image_size, 3), name="input_image")
    x = augmentation(inputs)
    x = layers.Rescaling(
        scale=1.0 / 127.5,
        offset=-1.0,
        name="mobilenet_preprocess",
    )(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D(name="pooling")(x)
    x = layers.Dropout(dropout, name="dropout")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="kidney_ct_classifier")
    return model, base_model


def set_fine_tune_layers(base_model: tf.keras.Model, fine_tune_layers: int) -> None:
    base_model.trainable = True

    if fine_tune_layers <= 0:
        fine_tune_layers = len(base_model.layers)

    freeze_until = max(0, len(base_model.layers) - fine_tune_layers)
    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False

    # Keep batch normalization layers frozen for stable fine-tuning.
    for layer in base_model.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False


def class_weights_from_labels(train_labels: list[int]) -> dict[int, float]:
    classes = np.arange(len(CLASS_NAMES))
    weights = compute_class_weight(
        class_weight="balanced", classes=classes, y=np.array(train_labels)
    )
    return {int(index): float(weight) for index, weight in enumerate(weights)}


def merge_histories(
    histories: list[tf.keras.callbacks.History],
) -> dict[str, list[float]]:
    merged: dict[str, list[float]] = {}
    for history in histories:
        for key, values in history.history.items():
            merged.setdefault(key, []).extend(float(value) for value in values)
    return merged


def save_training_plot(history_data: dict[str, list[float]], plot_out: Path) -> None:
    plot_out.parent.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    plt.plot(history_data.get("accuracy", []), label="Train Accuracy")
    plt.plot(history_data.get("val_accuracy", []), label="Validation Accuracy")
    plt.title("Model Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(history_data.get("loss", []), label="Train Loss")
    plt.plot(history_data.get("val_loss", []), label="Validation Loss")
    plt.title("Model Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()

    plt.tight_layout()
    plt.savefig(plot_out)
    plt.close()


def save_class_labels(labels_out: Path) -> None:
    labels_out.parent.mkdir(parents=True, exist_ok=True)
    labels = {index: name for index, name in enumerate(CLASS_NAMES)}
    with labels_out.open("w", encoding="utf-8") as labels_file:
        json.dump(labels, labels_file, indent=2)


def save_metrics(
    history_data: dict[str, list[float]],
    metrics_out: Path,
    class_files: dict[str, list[Path]],
    class_weight: dict[int, float],
) -> None:
    metrics_out.parent.mkdir(parents=True, exist_ok=True)

    val_accuracy = history_data.get("val_accuracy", [])
    val_loss = history_data.get("val_loss", [])

    best_val_accuracy = max(val_accuracy) if val_accuracy else None
    best_val_loss = min(val_loss) if val_loss else None
    best_epoch = int(np.argmax(val_accuracy) + 1) if val_accuracy else None

    payload = {
        "class_names": list(CLASS_NAMES),
        "class_distribution": {
            class_name: len(class_files[class_name]) for class_name in CLASS_NAMES
        },
        "class_weight": {str(index): weight for index, weight in class_weight.items()},
        "epochs_ran": len(history_data.get("loss", [])),
        "best_epoch_by_val_accuracy": best_epoch,
        "best_val_accuracy": best_val_accuracy,
        "best_val_loss": best_val_loss,
        "history": history_data,
    }

    with metrics_out.open("w", encoding="utf-8") as metrics_file:
        json.dump(payload, metrics_file, indent=2)


def main() -> None:
    args = parse_args()
    set_global_seed(args.seed)

    data_dir = args.data_dir.resolve()
    extra_stone_dir = args.extra_stone_dir.resolve() if args.extra_stone_dir else None

    class_files = build_class_file_index(data_dir, extra_stone_dir)
    for class_name in CLASS_NAMES:
        print(f"{class_name}: {len(class_files[class_name])} images")

    train_paths, train_labels, val_paths, val_labels = stratified_split(
        class_files=class_files,
        val_split=args.val_split,
        seed=args.seed,
    )

    print(f"Training samples: {len(train_paths)}")
    print(f"Validation samples: {len(val_paths)}")

    save_class_labels(args.labels_out.resolve())

    if args.dry_run:
        print("Dry run completed. Data indexing and label generation are valid.")
        return

    train_dataset = make_dataset(
        paths=train_paths,
        labels=train_labels,
        image_size=args.image_size,
        batch_size=args.batch_size,
        training=True,
        seed=args.seed,
    )
    val_dataset = make_dataset(
        paths=val_paths,
        labels=val_labels,
        image_size=args.image_size,
        batch_size=args.batch_size,
        training=False,
        seed=args.seed,
    )

    class_weight = class_weights_from_labels(train_labels)
    print(f"Class weights: {class_weight}")

    model, base_model = make_model(
        image_size=args.image_size,
        num_classes=len(CLASS_NAMES),
        dropout=args.dropout,
    )

    callbacks = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-7),
    ]

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=args.learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    print("Starting stage 1 training (frozen backbone)...")
    history_stage_1 = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=args.epochs,
        class_weight=class_weight,
        callbacks=callbacks,
        verbose=1,
    )

    history_list = [history_stage_1]

    if args.fine_tune_epochs > 0:
        set_fine_tune_layers(base_model, args.fine_tune_layers)
        model.compile(
            optimizer=tf.keras.optimizers.Adam(
                learning_rate=args.fine_tune_learning_rate
            ),
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )

        print("Starting stage 2 fine-tuning...")
        history_stage_2 = model.fit(
            train_dataset,
            validation_data=val_dataset,
            epochs=args.fine_tune_epochs,
            class_weight=class_weight,
            callbacks=callbacks,
            verbose=1,
        )
        history_list.append(history_stage_2)

    history_data = merge_histories(history_list)

    model_out = args.model_out.resolve()
    model_out.parent.mkdir(parents=True, exist_ok=True)
    model.save(model_out)

    save_training_plot(history_data, args.plot_out.resolve())
    save_metrics(
        history_data=history_data,
        metrics_out=args.metrics_out.resolve(),
        class_files=class_files,
        class_weight=class_weight,
    )

    print(f"Model saved to: {model_out}")
    print(f"Class labels saved to: {args.labels_out.resolve()}")
    print(f"Metrics saved to: {args.metrics_out.resolve()}")
    print(f"Training plot saved to: {args.plot_out.resolve()}")


if __name__ == "__main__":
    main()
