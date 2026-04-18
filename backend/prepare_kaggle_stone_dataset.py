import argparse
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable

from PIL import Image

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def parse_args() -> argparse.Namespace:
    base_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(
        description=(
            "Download the Kaggle kidney-stone object-detection dataset and "
            "extract stone crops for classifier training."
        )
    )
    parser.add_argument(
        "--dataset-ref",
        default="safurahajiheidari/kidney-stone-images",
        help="Kaggle dataset reference in owner/dataset format.",
    )
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=base_dir / "datasets" / "kaggle_kidney_stone_raw",
        help="Directory where the Kaggle dataset will be downloaded and extracted.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=base_dir / "datasets" / "stone_crops",
        help="Directory where extracted stone crops will be written.",
    )
    parser.add_argument(
        "--skip-download",
        action="store_true",
        help="Skip Kaggle download and use existing files in --raw-dir.",
    )
    parser.add_argument(
        "--overwrite-output",
        action="store_true",
        help="Delete and recreate --output-dir before extraction.",
    )
    parser.add_argument(
        "--padding-ratio",
        type=float,
        default=0.08,
        help="Padding ratio around each bounding box (0.08 means 8%%).",
    )
    parser.add_argument(
        "--min-crop-size",
        type=int,
        default=24,
        help="Minimum crop width/height in pixels.",
    )
    return parser.parse_args()


def run_kaggle_download(dataset_ref: str, raw_dir: Path) -> None:
    raw_dir.mkdir(parents=True, exist_ok=True)

    executable_name = "kaggle.exe" if sys.platform.startswith("win") else "kaggle"
    kaggle_executable = shutil.which(executable_name)
    if kaggle_executable is None:
        candidate = Path(sys.executable).parent / executable_name
        if candidate.exists():
            kaggle_executable = str(candidate)

    if kaggle_executable is None:
        raise RuntimeError(
            "Kaggle CLI executable was not found. Install it with `pip install kaggle` "
            "and ensure the virtualenv bin/Scripts directory is accessible."
        )

    command = [
        kaggle_executable,
        "datasets",
        "download",
        "-d",
        dataset_ref,
        "-p",
        str(raw_dir),
        "--unzip",
        "-q",
    ]

    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        details = exc.stderr.strip() or exc.stdout.strip()
        raise RuntimeError(f"Kaggle download failed: {details}") from exc


def find_dataset_root(raw_dir: Path) -> Path:
    if (raw_dir / "data.yaml").exists():
        return raw_dir

    candidates = [path.parent for path in raw_dir.rglob("data.yaml")]
    if not candidates:
        raise FileNotFoundError(
            "Could not locate data.yaml. Confirm the Kaggle dataset was downloaded "
            f"correctly into {raw_dir}."
        )

    return sorted(candidates, key=lambda path: len(path.parts))[0]


def resolve_image_path(images_dir: Path, stem: str) -> Path | None:
    for extension in IMAGE_EXTENSIONS:
        candidate = images_dir / f"{stem}{extension}"
        if candidate.exists():
            return candidate

    for candidate in images_dir.glob(f"{stem}.*"):
        if candidate.suffix.lower() in IMAGE_EXTENSIONS:
            return candidate

    return None


def parse_yolo_box(
    line: str, image_width: int, image_height: int
) -> tuple[int, int, int, int] | None:
    parts = line.strip().split()
    if len(parts) != 5:
        return None

    _, center_x, center_y, box_width, box_height = (float(value) for value in parts)
    left = int((center_x - box_width / 2.0) * image_width)
    top = int((center_y - box_height / 2.0) * image_height)
    right = int((center_x + box_width / 2.0) * image_width)
    bottom = int((center_y + box_height / 2.0) * image_height)

    left = max(0, min(left, image_width - 1))
    top = max(0, min(top, image_height - 1))
    right = max(1, min(right, image_width))
    bottom = max(1, min(bottom, image_height))

    if right <= left or bottom <= top:
        return None

    return left, top, right, bottom


def split_dirs(dataset_root: Path) -> Iterable[tuple[str, Path, Path]]:
    for split_name in ("train", "valid", "test"):
        labels_dir = dataset_root / split_name / "labels"
        images_dir = dataset_root / split_name / "images"
        if labels_dir.exists() and images_dir.exists():
            yield split_name, labels_dir, images_dir


def extract_stone_crops(
    dataset_root: Path,
    output_dir: Path,
    padding_ratio: float,
    min_crop_size: int,
) -> dict[str, int]:
    output_dir.mkdir(parents=True, exist_ok=True)

    stats = {
        "label_files": 0,
        "images_found": 0,
        "boxes_total": 0,
        "crops_saved": 0,
        "invalid_boxes": 0,
        "missing_images": 0,
        "small_crops": 0,
    }

    for split_name, labels_dir, images_dir in split_dirs(dataset_root):
        for label_path in sorted(labels_dir.glob("*.txt")):
            stats["label_files"] += 1
            image_path = resolve_image_path(images_dir, label_path.stem)
            if image_path is None:
                stats["missing_images"] += 1
                continue

            stats["images_found"] += 1
            lines = label_path.read_text(encoding="utf-8").splitlines()
            if not lines:
                continue

            with Image.open(image_path) as image_file:
                image = image_file.convert("RGB")
                width, height = image.size

                for index, line in enumerate(lines):
                    stats["boxes_total"] += 1
                    box = parse_yolo_box(line, width, height)
                    if box is None:
                        stats["invalid_boxes"] += 1
                        continue

                    left, top, right, bottom = box
                    pad_x = int((right - left) * padding_ratio)
                    pad_y = int((bottom - top) * padding_ratio)

                    left = max(0, left - pad_x)
                    top = max(0, top - pad_y)
                    right = min(width, right + pad_x)
                    bottom = min(height, bottom + pad_y)

                    crop = image.crop((left, top, right, bottom))
                    if crop.width < min_crop_size or crop.height < min_crop_size:
                        stats["small_crops"] += 1
                        continue

                    crop_name = (
                        f"{split_name}_{label_path.stem}_{index:02d}_"
                        f"{crop.width}x{crop.height}.jpg"
                    )
                    crop.save(output_dir / crop_name, format="JPEG", quality=95)
                    stats["crops_saved"] += 1

    return stats


def main() -> None:
    args = parse_args()

    if args.padding_ratio < 0 or args.padding_ratio > 0.5:
        raise ValueError("padding-ratio must be between 0 and 0.5")

    if not args.skip_download:
        run_kaggle_download(args.dataset_ref, args.raw_dir)

    dataset_root = find_dataset_root(args.raw_dir)

    if args.overwrite_output and args.output_dir.exists():
        shutil.rmtree(args.output_dir)

    stats = extract_stone_crops(
        dataset_root=dataset_root,
        output_dir=args.output_dir,
        padding_ratio=args.padding_ratio,
        min_crop_size=args.min_crop_size,
    )

    print("Kaggle stone crop extraction completed.")
    print(f"Dataset root: {dataset_root}")
    print(f"Output crops: {args.output_dir}")
    for key, value in stats.items():
        print(f"{key}: {value}")

    if stats["crops_saved"] == 0:
        raise RuntimeError(
            "No stone crops were produced. Check dataset files and label format before retraining."
        )

    print("\nRecommended next command:")
    print(
        "python train_model.py "
        f"--extra-stone-dir {args.output_dir} "
        "--epochs 25 --fine-tune-epochs 8"
    )


if __name__ == "__main__":
    main()
