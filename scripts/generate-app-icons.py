#!/usr/bin/env python3
"""Generate the existing macOS bundle icons from the editable SVG master.

Requires macOS (sips, iconutil) and librsvg (brew install librsvg).
Run: python3 scripts/generate-app-icons.py
"""

from pathlib import Path
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parent.parent
RESOURCES = ROOT / "resources"


def run(*args: object) -> None:
    subprocess.run([str(arg) for arg in args], check=True, stdout=subprocess.DEVNULL)


def main() -> None:
    for tool in ("rsvg-convert", "sips", "iconutil"):
        if shutil.which(tool) is None:
            raise SystemExit(f"Required tool not found: {tool}")

    source = (RESOURCES / "app-icon.svg").read_text()
    with tempfile.TemporaryDirectory(prefix="launcher-icons-") as temporary:
        staging = Path(temporary)
        # Swap the two colors so Debug is distinguishable beside Release.
        debug_source = source.replace("#303B51", "{debug_plate}").replace("#FAF8F1", "#303B51")
        debug_source = debug_source.replace("{debug_plate}", "#FAF8F1")
        variants = (
            ("AppIcon", source),
            ("AppIconDev", debug_source),
        )
        for name, artwork in variants:
            svg = staging / f"{name}.svg"
            svg.write_text(artwork)
            iconset = staging / f"{name}.iconset"
            iconset.mkdir()
            # Rasterize each representation directly from vector geometry;
            # include both Retina and non-Retina entries at every macOS size.
            for points in (16, 32, 128, 256, 512):
                for scale in (1, 2):
                    pixels = points * scale
                    suffix = "@2x" if scale == 2 else ""
                    output = iconset / f"icon_{points}x{points}{suffix}.png"
                    run("rsvg-convert", "--width", pixels, "--height", pixels, "--output", output, svg)
                    run("sips", "--setProperty", "profile", "/System/Library/ColorSync/Profiles/sRGB Profile.icc", output)
            run("iconutil", "--convert", "icns", "--output", staging / f"{name}.icns", iconset)
            if name == "AppIcon":
                shutil.copyfile(iconset / "icon_512x512@2x.png", staging / "app-icon.png")

        # Finish every conversion before replacing any checked-in output.
        for name in ("AppIcon.icns", "AppIconDev.icns", "app-icon.png"):
            shutil.copyfile(staging / name, RESOURCES / name)
            print(f"Generated resources/{name}")


if __name__ == "__main__":
    main()
