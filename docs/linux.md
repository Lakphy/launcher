# Launcher on Linux

## Install

Release archives are on the
[GitHub releases page](https://github.com/Lakphy/launcher/releases).
From a checkout, the install script downloads the latest tarball:

```sh
sh scripts/install-linux.sh
```

To install a tarball you already have:

```sh
LAUNCHER_BUNDLE_PATH=launcher-<version>-<target>.tar.gz \
  sh scripts/install-linux.sh
```

The script needs no root. It unpacks the release tarball into
`~/.local/launcher.app` and installs the desktop entry into
`~/.local/share/applications`, so **Launcher appears in your applications menu** —
you can also launch it from a terminal via `launcher` command. Run the script again to
upgrade. In-app updates stay off until this fork publishes its own feed and signing key.

Launcher expects:

- **glibc 2.35 or newer** — Ubuntu 22.04, Debian 12, Fedora 36, and anything
  more recent. Releases are built on Ubuntu 22.04, so older distributions must
  build from source.
- **A working Vulkan or OpenGL driver.** Launcher renders through wgpu, which tries
  Vulkan first and falls back to GL. Software rasterizers (lavapipe, llvmpipe)
  are accepted, so it can run in a VM, but see the note below.
- **x86_64 or aarch64.** Other architectures build from source.
- `xdg-desktop-portal` for native file dialogs.
- `curl` or `wget` for installation and update downloads.

Set `LAUNCHER_VERSION` to install a specific version rather than the latest.

## Installing manually

The script is a convenience, not a requirement. Download
`launcher-<version>-<target>.tar.gz` from
the [GitHub release](https://github.com/Lakphy/launcher/releases), then unpack it
wherever you like:

```sh
mkdir -p ~/.local/launcher.app
tar -xzf launcher-<version>-<target>.tar.gz --strip-components=1 -C ~/.local/launcher.app
ln -sf ~/.local/launcher.app/bin/launcher ~/.local/bin/launcher   # optional
```

The archive uses an install-prefix layout (`bin/`, `share/`) beneath one
versioned directory, so `--strip-components=1` into a prefix such as
`/usr/local` works too.

**Keep `bin/` and `share/launcher/` intact.** Launcher launches its daemon, updater,
and Computer Use helpers from `bin/`; the SDK library and supporting resources
ship in the same installation. A symlink is fine — Launcher resolves it back to
the real path.

Installing the desktop entry is the part that matters — it is how the app is
launched normally, and it is what associates the running window with its icon
and name (Launcher reports the Wayland `app_id` / X11 `WM_CLASS` `dev.lakphy.launcher`, which
matches the entry's filename). Install the packaged file and point it at the
install (the packaged copy uses bare `Exec=launcher` and `Icon=dev.lakphy.launcher` names so it
can be relocated):

```sh
install -D ~/.local/launcher.app/share/applications/dev.lakphy.launcher.desktop \
  -t ~/.local/share/applications
sed -i "s|^Exec=launcher$|Exec=$HOME/.local/launcher.app/bin/launcher|" \
  ~/.local/share/applications/dev.lakphy.launcher.desktop
sed -i "s|^Icon=dev.lakphy.launcher$|Icon=$HOME/.local/launcher.app/share/icons/hicolor/256x256/apps/dev.lakphy.launcher.png|" \
  ~/.local/share/applications/dev.lakphy.launcher.desktop
```

## Updating

In-app updates are off in this fork. They stay off until `SUPublicEDKey` is
replaced and a feed you control is compiled in. Re-run the install script to
upgrade a `~/.local/launcher.app` install. Once a feed is configured, that
install checks once per launch; an available release appears in the sidebar
footer. Clicking it validates the staged installation, quits through Launcher's
normal draft/state saves, swaps the complete prefix, and relaunches. If the new
build exits before opening its window, the helper restores and relaunches the
previous version.

System-wide installs such as
`/usr/local`, builds without the managed-install marker, root sessions, and
package-manager-owned builds do not modify themselves; upgrade those through
their original installation method. Re-running `scripts/install-linux.sh` remains a safe
manual fallback for the default `~/.local/launcher.app` install.

## Uninstalling

```sh
sh scripts/install-linux.sh --uninstall
```

This removes `~/.local/launcher.app`, the symlink, and the desktop entry. Projects
and settings stay in `~/.launcher`; delete that directory to remove them too.

## Building from source

See [CONTRIBUTING.md](../CONTRIBUTING.md) for build prerequisites, then
install Bun for the SDK artifact assembler, then produce the same archive
this page installs with:

```sh
./scripts/bundle-linux.sh
```

To exercise the install script against that local build:

```sh
LAUNCHER_BUNDLE_PATH=target/release/launcher-<version>-<target>.tar.gz \
  sh scripts/install-linux.sh
```

## Computer Use

Debug builds expose Computer Use through the bundled Cua Driver SDK. X11 and
AT-SPI use the current desktop session; native Wayland support is experimental
and depends on compositor integrations. See [Computer Use](computer-use.md)
for capability checks, packaged helper files, and limitations.

## Running in a virtual machine

VMs usually have no GPU passthrough, so Mesa falls back to a software
rasterizer. That works in principle — wgpu accepts a CPU adapter — but both
lavapipe (Vulkan) and llvmpipe (GL) JIT-compile shaders through LLVM, and that
path is fragile: on Fedora 44 aarch64 (mesa 26.0.3 + LLVM 22.1) it segfaults
inside `gallivm_jit_function` while compiling a fragment shader. The crash is
in the driver, not in Launcher, and no application-side setting avoids it.

If the app dies on its first frame in a VM, check `coredumpctl info` for a
backtrace through `libvulkan_lvp.so` or `libgallium`. The reliable fix is to
give the guest a real GL driver — on UTM that means the QEMU backend with
virtio-gpu-gl (virgl) rather than Apple Virtualization, which offers Linux
guests no 3D at all. `VK_DRIVER_FILES=/nonexistent.json` hides the software
Vulkan driver so wgpu takes the GL path instead.
