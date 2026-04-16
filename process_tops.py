"""Detourage IA (rembg) + creation d'icones PNG transparentes pour les TOPS (hauts du corps)."""
import os
os.environ['NUMBA_DISABLE_JIT'] = '1'

from pathlib import Path
from rembg import remove
from PIL import Image
from io import BytesIO


def process_image(input_path, output_path, icon_size=400):
    with open(input_path, 'rb') as f:
        input_data = f.read()

    output_data = remove(input_data)
    img = Image.open(BytesIO(output_data)).convert('RGBA')

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    w, h = img.size
    max_dim = max(w, h)
    padding = int(max_dim * 0.06)
    canvas_size = max_dim + padding * 2

    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_x = (canvas_size - w) // 2
    offset_y = (canvas_size - h) // 2
    canvas.paste(img, (offset_x, offset_y), img)

    canvas = canvas.resize((icon_size, icon_size), Image.LANCZOS)
    canvas.save(output_path, 'PNG', optimize=True)


def process_batch(input_dir, output_dir, category_name, icon_size=400):
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
    images = sorted([f for f in input_path.iterdir() if f.suffix.lower() in extensions])

    print(f"Traitement de {len(images)} images ({category_name})...")

    for i, img_file in enumerate(images, 1):
        out_name = f"{category_name}_{i:02d}.png"
        out_file = output_path / out_name
        print(f"  [{i}/{len(images)}] {img_file.name} -> {out_name}...", end=' ', flush=True)
        try:
            process_image(str(img_file), str(out_file), icon_size)
            print("OK")
        except Exception as e:
            print(f"ERREUR: {e}")

    print(f"Termine ! {len(images)} icones dans {output_path}")


if __name__ == '__main__':
    input_dir = r"C:\Users\Nicolas\Desktop\Icones Lutin meteo\Habits Lutin Meteo\Tops"
    output_dir = r"C:\Users\Nicolas\ClaudeCodeLocal\lutin-meteo\assets\clothes\tops"
    process_batch(input_dir, output_dir, "top", icon_size=400)
