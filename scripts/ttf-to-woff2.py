"""One-off: convert the shipped Montserrat TTFs to woff2.

The three Montserrat faces were the only .ttf fonts on the site and accounted for
~580 KB of the critical path. woff2 wraps the same glyphs in Brotli, so the text
renders identically at a fraction of the transfer size.

Run from the project root with the DSH runtime python:

    python scripts/ttf-to-woff2.py
"""
import pathlib

from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"

FACES = ["Montserrat-Regular", "Montserrat-Medium", "Montserrat-Bold"]

for face in FACES:
    src = FONTS / f"{face}.ttf"
    dst = FONTS / f"{face}.woff2"

    font = TTFont(src)
    font.flavor = "woff2"
    font.save(dst)

    print(f"{face}: {src.stat().st_size / 1024:.1f} KB -> {dst.stat().st_size / 1024:.1f} KB")
