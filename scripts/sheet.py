"""Contact sheet of screenshots: python3 scripts/sheet.py out.png a.png b.png ..."""
import sys
from PIL import Image

out, names = sys.argv[1], sys.argv[2:]
ims = [Image.open(n).convert("RGB") for n in names]
w, h = ims[0].size
sheet = Image.new("RGB", (len(ims) * (w + 16) - 16, h), "white")
for i, im in enumerate(ims):
    sheet.paste(im, (i * (w + 16), 0))
sheet.save(out)
