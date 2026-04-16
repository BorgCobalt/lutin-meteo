"""
Script universel de détourage pour Lutin Météo.

Utilise un manifest JSON pour tracker source → output.
Les photos déjà traitées ne sont JAMAIS retraitées ni renumérotées,
même si de nouvelles photos sont ajoutées au dossier source.

Usage :
    python process_clothes_smart.py <categorie>

Catégories définies dans CATEGORIES ci-dessous.
"""
import os
os.environ['NUMBA_DISABLE_JIT'] = '1'

import sys
import json
from pathlib import Path
from rembg import remove
from PIL import Image
from io import BytesIO

# ── CONFIG ──────────────────────────────────────────────────────────────────

BASE_DESKTOP = Path(r"C:\Users\Nicolas\Desktop\Icones Lutin meteo\Habits Lutin Meteo")
BASE_ASSETS  = Path(r"C:\Users\Nicolas\ClaudeCodeLocal\lutin-meteo\assets\clothes")
MANIFEST_FILE = BASE_ASSETS / "manifest.json"

CATEGORIES = {
    "tops":   {"src": BASE_DESKTOP / "Tops",
               "out": BASE_ASSETS  / "tops",
               "prefix": "top",
               "seasons": None},           # toute l'année

    "pulls":  {"src": BASE_DESKTOP / "Pull-Overs",
               "out": BASE_ASSETS  / "pulls",
               "prefix": "pull",
               "seasons": None},

    "robes":  {"src": BASE_DESKTOP / "Robes_Jupes_Combinaisons_PrintempsEte",
               "out": BASE_ASSETS  / "robes",
               "prefix": "robe",
               "seasons": ["printemps", "ete"]},

    # à venir
    "crop_tops": {"src": BASE_DESKTOP / "Crop-Tops PrintempsEte",
                  "out": BASE_ASSETS  / "crop_tops",
                  "prefix": "crop_top",
                  "seasons": ["printemps", "ete"]},

    "chemisiers": {"src": BASE_DESKTOP / "Chemisiers",
                   "out": BASE_ASSETS  / "chemisiers",
                   "prefix": "chemisier",
                   "seasons": None},

    "hauts":  {"src": BASE_DESKTOP / "Hauts",
               "out": BASE_ASSETS  / "hauts",
               "prefix": "haut",
               "seasons": None},

    "pantalons": {"src": BASE_DESKTOP / "Pantalons",
                  "out": BASE_ASSETS  / "pantalons",
                  "prefix": "pantalon",
                  "seasons": None},

    "chaussures": {"src": BASE_DESKTOP / "Chaussures",
                   "out": BASE_ASSETS  / "chaussures",
                   "prefix": "chaussure",
                   "seasons": None},
}

EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
ICON_SIZE = 400

# ── MANIFEST ────────────────────────────────────────────────────────────────

def load_manifest():
    if MANIFEST_FILE.exists():
        with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_manifest(manifest):
    MANIFEST_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Manifest mis à jour : {MANIFEST_FILE}")

# ── TRAITEMENT IMAGE ─────────────────────────────────────────────────────────

def process_image(input_path, output_path):
    with open(input_path, 'rb') as f:
        data = remove(f.read())
    img = Image.open(BytesIO(data)).convert('RGBA')
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    w, h = img.size
    max_dim = max(w, h)
    pad = int(max_dim * 0.06)
    size = max_dim + pad * 2
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    canvas.paste(img, ((size - w) // 2, (size - h) // 2), img)
    canvas.resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS).save(output_path, 'PNG', optimize=True)

# ── BATCH ────────────────────────────────────────────────────────────────────

def process_category(cat_name):
    if cat_name not in CATEGORIES:
        print(f"Catégorie inconnue : {cat_name}")
        print(f"Catégories disponibles : {', '.join(CATEGORIES)}")
        return

    cfg = CATEGORIES[cat_name]
    src_dir  = cfg["src"]
    out_dir  = cfg["out"]
    prefix   = cfg["prefix"]

    if not src_dir.exists():
        print(f"Dossier source introuvable : {src_dir}")
        return

    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()

    # Section de la catégorie dans le manifest
    if cat_name not in manifest:
        manifest[cat_name] = {}   # {source_filename: output_filename}

    cat_manifest = manifest[cat_name]

    # Fichiers sources triés
    sources = sorted([f for f in src_dir.iterdir() if f.suffix.lower() in EXTENSIONS])

    # Prochain numéro = max existant + 1
    existing_nums = [int(v.split('_')[-1].replace('.png',''))
                     for v in cat_manifest.values() if v.endswith('.png')]
    next_num = max(existing_nums, default=0) + 1

    new_count = 0
    skip_count = 0

    for src_file in sources:
        key = src_file.name
        if key in cat_manifest:
            skip_count += 1
            continue  # déjà traité, on ne touche pas

        out_name = f"{prefix}_{next_num:02d}.png"
        out_file = out_dir / out_name
        print(f"  [{next_num}] {key} -> {out_name}...", end=' ', flush=True)
        try:
            process_image(str(src_file), str(out_file))
            cat_manifest[key] = out_name
            manifest[cat_name] = cat_manifest
            save_manifest(manifest)   # sauvegarde après chaque image (sécurité)
            print("OK")
            next_num += 1
            new_count += 1
        except Exception as e:
            print(f"ERREUR: {e}")

    total = len(sources)
    print(f"\nTerminé ! {new_count} nouvelles images traitées, {skip_count}/{total} déjà connues.")
    if cfg["seasons"]:
        print(f"Saisons : {', '.join(cfg['seasons'])}")

# ── RETROGRADE MANIFEST (pulls + tops déjà traités) ─────────────────────────

def retrograde_existing():
    """Reconstruit les entrées manifest pour tops et pulls déjà traités."""
    manifest = load_manifest()
    changed = False

    for cat_name in ("tops", "pulls"):
        cfg = CATEGORIES[cat_name]
        src_dir = cfg["src"]
        prefix  = cfg["prefix"]
        out_dir = cfg["out"]

        if not src_dir.exists() or not out_dir.exists():
            continue
        if cat_name in manifest and manifest[cat_name]:
            print(f"{cat_name} : manifest déjà renseigné ({len(manifest[cat_name])} entrées), ignoré.")
            continue

        sources = sorted([f for f in src_dir.iterdir() if f.suffix.lower() in EXTENSIONS])
        outputs = sorted([f for f in out_dir.iterdir() if f.suffix == '.png'])

        if len(sources) != len(outputs):
            print(f"ATTENTION {cat_name}: {len(sources)} sources vs {len(outputs)} outputs — vérifier manuellement.")
            continue

        manifest[cat_name] = {}
        for src, out in zip(sources, outputs):
            manifest[cat_name][src.name] = out.name

        print(f"{cat_name} : {len(sources)} entrées rétrogradées dans le manifest.")
        changed = True

    if changed:
        save_manifest(manifest)
    else:
        print("Rien à rétrograder.")

# ── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        print("Commandes spéciales :")
        print("  retrograde   — reconstruit le manifest pour tops/pulls existants")
        sys.exit(0)

    cmd = sys.argv[1]
    if cmd == 'retrograde':
        retrograde_existing()
    else:
        process_category(cmd)
