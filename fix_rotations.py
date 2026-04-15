"""Fix orientation of pull-over icons that are upside down."""
from PIL import Image
from pathlib import Path

PULLS_DIR = Path(r"C:\Users\Nicolas\ClaudeCodeLocal\lutin-meteo\assets\clothes\pulls")

# Pulls that need 180° rotation (upside down)
ROTATE_180 = [3, 6, 7, 9, 13, 21, 22, 23, 24, 26, 27]

for num in ROTATE_180:
    fname = f"pull_{num:02d}.png"
    fpath = PULLS_DIR / fname
    if fpath.exists():
        img = Image.open(fpath)
        img = img.rotate(180, expand=False)
        img.save(fpath, 'PNG', optimize=True)
        print(f"Rotated 180°: {fname}")
    else:
        print(f"NOT FOUND: {fname}")

print("Done!")
