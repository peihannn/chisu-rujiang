from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

def make_transparent(source_name: str, target_name: str) -> None:
    image = Image.open(Path("assets") / source_name).convert("RGBA")
    pixels = image.load()
    alpha = Image.new("L", image.size)
    alpha_pixels = alpha.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, _ = pixels[x, y]
            warmth = 255 - min(r, g, b)
            alpha_pixels[x, y] = max(0, min(255, int((warmth - 6) * 12)))

    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=1.15))
    image.putalpha(alpha)
    bounds = alpha.getbbox()
    if bounds:
        pad = 3
        left = max(0, bounds[0] - pad)
        top = max(0, bounds[1] - pad)
        right = min(image.width, bounds[2] + pad)
        bottom = min(image.height, bounds[3] + pad)
        image = image.crop((left, top, right, bottom))
    image.save(Path("assets") / target_name, "PNG", optimize=True)


make_transparent("paper_light.png", "paper_light_transparent.png")
make_transparent("ripple.png", "ripple_transparent.png")


def make_torn_note_cutout() -> None:
    """Extract a small, irregularly transparent piece from the old-paper prop.

    Light parchment is deliberately made translucent so it reads as a weathered
    object on water, rather than as a pale rectangular UI panel.
    """
    # This source is a naturally narrow, heavily torn old-paper fragment.
    # It avoids the horizontal panel silhouette of paper_light.png.
    source = Image.open(Path("assets") / "paper_boat.png").convert("RGBA")
    note = ImageEnhance.Brightness(source).enhance(0.72)
    note = ImageEnhance.Color(note).enhance(0.78)
    alpha = Image.new("L", note.size, 0)
    source_pixels = note.load()
    alpha_pixels = alpha.load()
    for y in range(note.height):
        for x in range(note.width):
            r, g, b, _ = source_pixels[x, y]
            luminance = (r * 0.299) + (g * 0.587) + (b * 0.114)
            # Keep folds and stains, but let broad pale fields dissolve into the river.
            texture = max(0, min(210, int((244 - luminance) * 3.1)))
            alpha_pixels[x, y] = texture
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=1.4))
    note.putalpha(alpha)
    bounds = alpha.getbbox()
    if bounds:
        pad = 4
        note = note.crop((max(0, bounds[0] - pad), max(0, bounds[1] - pad), min(note.width, bounds[2] + pad), min(note.height, bounds[3] + pad)))
    note.save(Path("assets") / "paper_light_cutout.png", "PNG", optimize=True)


make_torn_note_cutout()
