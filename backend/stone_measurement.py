import math
from typing import Any

import numpy as np
from PIL import Image

MEASUREMENT_METHOD = "intensity_component_v1"


def _unavailable(reason: str) -> dict[str, Any]:
    return {
        "available": False,
        "method": MEASUREMENT_METHOD,
        "reason": reason,
    }


def _count_neighbors(mask: np.ndarray) -> np.ndarray:
    height, width = mask.shape
    counts = np.zeros((height, width), dtype=np.uint8)

    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy == 0 and dx == 0:
                continue

            if dy >= 0:
                src_y = slice(0, height - dy)
                dst_y = slice(dy, height)
            else:
                src_y = slice(-dy, height)
                dst_y = slice(0, height + dy)

            if dx >= 0:
                src_x = slice(0, width - dx)
                dst_x = slice(dx, width)
            else:
                src_x = slice(-dx, width)
                dst_x = slice(0, width + dx)

            counts[dst_y, dst_x] += mask[src_y, src_x]

    return counts


def _largest_connected_component(
    mask: np.ndarray,
) -> tuple[int, tuple[int, int, int, int] | None]:
    height, width = mask.shape
    visited = np.zeros((height, width), dtype=bool)

    best_area = 0
    best_bbox: tuple[int, int, int, int] | None = None

    candidate_points = np.argwhere(mask)
    for point in candidate_points:
        y = int(point[0])
        x = int(point[1])
        if visited[y, x]:
            continue

        stack = [(y, x)]
        visited[y, x] = True

        area = 0
        min_x = max_x = x
        min_y = max_y = y

        while stack:
            current_y, current_x = stack.pop()
            area += 1

            if current_x < min_x:
                min_x = current_x
            if current_x > max_x:
                max_x = current_x
            if current_y < min_y:
                min_y = current_y
            if current_y > max_y:
                max_y = current_y

            y_start = max(0, current_y - 1)
            y_end = min(height, current_y + 2)
            x_start = max(0, current_x - 1)
            x_end = min(width, current_x + 2)

            for next_y in range(y_start, y_end):
                for next_x in range(x_start, x_end):
                    if visited[next_y, next_x] or not mask[next_y, next_x]:
                        continue

                    visited[next_y, next_x] = True
                    stack.append((next_y, next_x))

        if area > best_area:
            best_area = area
            best_bbox = (min_x, min_y, max_x, max_y)

    return best_area, best_bbox


def estimate_stone_measurement(
    image: Image.Image,
    pixel_spacing_mm: float | None = None,
    threshold_percentile: float = 99.4,
    min_component_pixels: int = 12,
) -> dict[str, Any]:
    grayscale = np.asarray(image.convert("L"), dtype=np.float32)

    if grayscale.ndim != 2:
        return _unavailable("invalid_grayscale_conversion")

    height, width = grayscale.shape
    if height < 8 or width < 8:
        return _unavailable("image_too_small")

    margin_y = max(2, int(height * 0.04))
    margin_x = max(2, int(width * 0.04))

    core = grayscale[margin_y : height - margin_y, margin_x : width - margin_x]
    if core.size == 0:
        return _unavailable("insufficient_image_area")

    threshold_value = float(np.percentile(core, threshold_percentile))
    threshold_value = max(130.0, min(255.0, threshold_value))

    candidate_mask = np.zeros_like(grayscale, dtype=bool)
    candidate_mask[margin_y : height - margin_y, margin_x : width - margin_x] = (
        core >= threshold_value
    )

    if not np.any(candidate_mask):
        return _unavailable("no_high_intensity_region")

    neighbor_counts = _count_neighbors(candidate_mask.astype(np.uint8))
    candidate_mask = candidate_mask & (neighbor_counts >= 2)

    if not np.any(candidate_mask):
        return _unavailable("no_stable_candidate_region")

    area_px, bbox = _largest_connected_component(candidate_mask)
    if bbox is None or area_px < min_component_pixels:
        return _unavailable("no_component_above_min_size")

    min_x, min_y, max_x, max_y = bbox
    width_px = max_x - min_x + 1
    height_px = max_y - min_y + 1
    equivalent_diameter_px = float(2.0 * math.sqrt(area_px / math.pi))

    result: dict[str, Any] = {
        "available": True,
        "method": MEASUREMENT_METHOD,
        "bounding_box": {
            "x": int(min_x),
            "y": int(min_y),
            "width": int(width_px),
            "height": int(height_px),
            "right": int(max_x),
            "bottom": int(max_y),
            "center_x": int((min_x + max_x) // 2),
            "center_y": int((min_y + max_y) // 2),
        },
        "size_px": {
            "area": int(area_px),
            "width": int(width_px),
            "height": int(height_px),
            "max_dimension": int(max(width_px, height_px)),
            "equivalent_diameter": round(equivalent_diameter_px, 2),
        },
    }

    if pixel_spacing_mm is not None and pixel_spacing_mm > 0:
        result["size_mm"] = {
            "width": round(width_px * pixel_spacing_mm, 2),
            "height": round(height_px * pixel_spacing_mm, 2),
            "max_dimension": round(max(width_px, height_px) * pixel_spacing_mm, 2),
            "equivalent_diameter": round(equivalent_diameter_px * pixel_spacing_mm, 2),
            "pixel_spacing": round(pixel_spacing_mm, 5),
        }

    return result
