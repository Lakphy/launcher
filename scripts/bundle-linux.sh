#!/usr/bin/env bash

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

target_dir="${CARGO_TARGET_DIR:-target}"
version="$(cargo metadata --no-deps --format-version 1 | sed -n 's/.*"name":"launcher","version":"\([^"]*\)".*/\1/p')"
target_triple="$(rustc -vV | sed -n 's/^host: //p')"
package="launcher-${version}-${target_triple}"
archive="$target_dir/release/$package.tar.gz"
staging="$(mktemp -d)"
trap 'rm -rf -- "$staging"' EXIT

cargo build --locked --release \
  --package launcher --bin launcher --bin launcher-updater --bin launcher_js_repl \
  --package launcher-daemon --bin launcher-daemon \
  --package launcher-computer-use --bin launcher_computer_use

package_dir="$staging/$package"
bun scripts/cua-driver.ts bundle "$package_dir/bin" "$package_dir/share/launcher" release
install -Dm755 "$target_dir/release/launcher" "$package_dir/bin/launcher"
install -Dm755 "$target_dir/release/launcher-updater" "$package_dir/bin/launcher-updater"
install -Dm755 "$target_dir/release/launcher-daemon" "$package_dir/bin/launcher-daemon"
install -Dm644 resources/linux/dev.lakphy.launcher.desktop \
  "$package_dir/share/applications/dev.lakphy.launcher.desktop"
install -Dm644 resources/linux/self-update-v1 \
  "$package_dir/share/launcher/self-update-v1"
install -Dm644 website/public/app-icon.png \
  "$package_dir/share/icons/hicolor/256x256/apps/dev.lakphy.launcher.png"
install -Dm644 LICENSE "$package_dir/share/licenses/launcher/LICENSE"

mkdir -p "$(dirname "$archive")"
tar -C "$staging" -czf "$archive" "$package"
printf 'Created %s\n' "$archive"
