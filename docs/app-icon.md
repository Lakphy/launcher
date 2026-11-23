# Launcher app icon

Launcher is a native entry point for local coding agents. Its icon uses three
curved shapes that converge around a common center.

## Design rationale

The converging shapes reflect the projects, sessions, and agents Launcher
brings together. The artwork uses two flat fills and open space between the
shapes to keep them distinct at Dock and Finder sizes.

The design follows Apple's guidance to emphasize one simple idea, use a quiet
background, and omit nonessential text and artificial visual effects:
[App icons — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons).

## Artwork and packaging

`resources/app-icon.svg` is the editable 1024 × 1024 master. Release uses
`#303B51` for the plate and `#FAF8F1` for the mark. Debug swaps the two colors.
The plate occupies coordinates 25–231 in the 256-unit viewBox, leaving a
transparent margin for the existing macOS ICNS packaging. This pre-shaped plate
is for that packaging;
an Icon Composer migration should use separate unmasked, full-canvas layers as
Apple specifies, rather than importing the pre-shaped bitmap as a background.

Regenerate on macOS with Python 3 and librsvg (`brew install librsvg`):

```sh
python3 scripts/generate-app-icons.py
```

The generator rasterizes each size directly from SVG, embeds the sRGB profile,
and writes:

- `resources/AppIcon.icns`: Release bundle icon.
- `resources/AppIconDev.icns`: Debug bundle icon, distinguished by its light plate.
- `resources/app-icon.png`: 1024 × 1024 shared desktop/web artwork.

Each ICNS includes 16, 32, 128, 256, and 512 point representations at both 1×
and 2×. `scripts/bundle.sh` already selects the corresponding ICNS and copies it
to `Contents/Resources/AppIcon.icns`; `resources/Info.plist` already references
that name. No bundle identifier or runtime behavior changes are needed.

The shared PNG is also used by the Linux desktop and web connection/startup/sidebar
components. The separate Windows ICO and mobile artwork are outside this macOS
change.
