"""Encode approved Figma photography as responsive WebP without changing content."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
assets = root / 'public' / 'assets'
sources = root / 'sources' / 'figma'
sources.mkdir(parents=True, exist_ok=True)
for name, widths in {'hero': [800, 1600, 2400], 'dough': [600, 900], 'oven': [600, 1600, 2400], 'pizza': [800, 1600, 2400]}.items():
    original = assets / f'{name}.png'
    source = sources / f'{name}.jpg'
    if original.exists():
        original.replace(source)
    with Image.open(source) as raw:
        photo = ImageOps.exif_transpose(raw).convert('RGB')
        for width in widths:
            image = photo.copy()
            image.thumbnail((width, round(photo.height * width / photo.width)), Image.Resampling.LANCZOS)
            target = assets / f'{name}-{width}.webp'
            image.save(target, 'WEBP', quality=82, method=6)
            print(f'{target.name}: {target.stat().st_size:,} bytes')
