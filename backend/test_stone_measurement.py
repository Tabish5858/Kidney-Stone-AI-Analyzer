import unittest

from PIL import Image

from stone_measurement import estimate_stone_measurement


class StoneMeasurementTests(unittest.TestCase):
    def test_detects_bright_region_and_reports_size(self):
        image = Image.new("L", (128, 128), color=25)
        for y in range(48, 68):
            for x in range(40, 70):
                image.putpixel((x, y), 255)

        measurement = estimate_stone_measurement(
            image.convert("RGB"), pixel_spacing_mm=0.5
        )

        self.assertTrue(measurement["available"])
        self.assertIn("bounding_box", measurement)
        self.assertIn("size_px", measurement)
        self.assertIn("size_mm", measurement)

        bounding_box = measurement["bounding_box"]
        size_px = measurement["size_px"]
        size_mm = measurement["size_mm"]

        self.assertGreaterEqual(bounding_box["x"], 40)
        self.assertLessEqual(bounding_box["x"], 42)
        self.assertGreaterEqual(bounding_box["y"], 48)
        self.assertLessEqual(bounding_box["y"], 50)
        self.assertGreaterEqual(size_px["width"], 28)
        self.assertGreaterEqual(size_px["height"], 18)
        self.assertGreater(size_px["equivalent_diameter"], 0)
        self.assertAlmostEqual(size_mm["pixel_spacing"], 0.5, places=5)

    def test_returns_unavailable_for_uniform_image(self):
        image = Image.new("RGB", (128, 128), color=(60, 60, 60))

        measurement = estimate_stone_measurement(image)

        self.assertFalse(measurement["available"])
        self.assertIn("reason", measurement)


if __name__ == "__main__":
    unittest.main()
