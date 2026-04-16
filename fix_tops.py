"""Fix orientation of tops that are upside down."""
from PIL import Image
from pathlib import Path

TOPS_DIR = Path(r"C:\Users\Nicolas\ClaudeCodeLocal\lutin-meteo\assets\clothes\tops")

ROTATE_180 = [5, 7, 9, 11, 12, 13, 14, 15, 16, 18, 19, 21, 22, 23]

for num in ROTATE_180:
    fname = f"top_{num:02d}.png"
    fpath = TOPS_DIR / fname
    if fpath.exists():
        img = Image.open(fpath)
        img = img.rotate(180, expand=False)
        img.save(fpath, 'PNG', optimize=True)
        print(f"Rotated 180°: {fname}")
    else:
        print(f"NOT FOUND: {fname}")

print("Done!")
