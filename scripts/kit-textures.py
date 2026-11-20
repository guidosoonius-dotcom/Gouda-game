"""Turn generated material photos into the detail maps of public/img/kit (see decision 59):
the linear colour ratio to the mean, divided by 3. Usage: python3 scripts/kit-textures.py <png dir> public/img/kit
Also writes <png dir>/applied.jpg, the maps on the kit colours, to check them by eye."""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
KEEP = {'brick': 0.8, 'tiles': 0.6, 'wood': 0.2, 'stone': 0.5, 'cobble': 0.7, 'plaster': 0.5}
BASE = {'brick': '#7a4a3a', 'tiles': '#4a3d3a', 'wood': '#7a5a3a', 'stone': '#9a968c', 'cobble': '#6e6a63', 'plaster': '#b9b2a2'}
def lin(a): return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
def srgb(a): return np.where(a <= 0.0031308, a * 12.92, 1.055 * np.power(np.clip(a, 0, None), 1 / 2.4) - 0.055)
sheet = Image.new('RGB', (768, 512))
for i, (n, k) in enumerate(KEEP.items()):
    a = lin(np.asarray(Image.open(f'{src}/{n}.png').convert('RGB').resize((512, 512), Image.LANCZOS)).astype(np.float64) / 255)
    lum = (a @ np.array([0.2126, 0.7152, 0.0722]))[..., None]
    a = lum + (a - lum) * k
    m = lum.max()
    L = Image.fromarray((np.clip(lum[..., 0] / m, 0, 1) * 255).astype(np.uint8))
    big = np.asarray(L.filter(ImageFilter.GaussianBlur(64))).astype(np.float64)[..., None] / 255 * m + 1e-4
    flat = a / big
    ratio = flat / flat.reshape(-1, 3).mean(0)
    out = np.clip(ratio / 3, 0, 1)
    Image.fromarray((out * 255 + 0.5).astype(np.uint8)).save(f'{dst}/{n}.webp', quality=84, method=6)
    print(n, os.path.getsize(f'{dst}/{n}.webp') // 1024, 'KB clipped', (ratio > 3).mean().round(4))
    base = lin(np.array([int(BASE[n][j:j + 2], 16) for j in (1, 3, 5)]) / 255)
    prev = srgb(np.clip(base * np.clip(ratio, 0, 3), 0, 1))
    sheet.paste(Image.fromarray((prev[:256, :256] * 255).astype(np.uint8)), ((i % 3) * 256, (i // 3) * 256))
sheet.save(f'{src}/applied.jpg')
