# Launcher on Windows

## Install

Download `Launcher-<version>-x86_64-Setup.exe` (or the `aarch64` installer on an
Arm device) from the
[GitHub release](https://github.com/Lakphy/launcher/releases) and run it. It
installs per-user into `%LOCALAPPDATA%\Programs\Launcher`, so it never asks for
administrator rights.

### Portable

`launcher-<version>-<target>.zip` is the same build without an installer. Unpack it
anywhere and run `launcher.exe`.

**Keep the installation folder intact.** Launcher launches its daemon and
Computer Use helpers from this directory and loads the bundled SDK DLL and
`resources/` files. Moving `launcher.exe` out on its own leaves those unavailable.
A shortcut is fine.

When in-app updates are enabled, a portable copy updates in place: the updater
passes the running directory to the installer, so it replaces that copy rather
than creating a second install.

Launcher expects:

- **Windows 10 version 1809 or newer**, or Windows 11.
- **A Direct3D 11 driver at feature level 11_0 or newer.** GPUI renders
  through DirectX and falls back to the Microsoft Basic Render Driver, so it
  can run in a VM — see Troubleshooting if the window comes up black.
- **x86_64 or aarch64.**

Nothing else: Launcher links the C runtime statically, so there is no Visual C++
redistributable to install first. That matters most on Arm devices, which
rarely have the arm64 redistributable already.

SmartScreen may warn about an unrecognized publisher on first launch when the
release was not code-signed. Choose **More info → Run anyway**.

## Updating

In-app updates are off in this fork until a feed and signing key are configured.
The updater preference, once updates are enabled, lives in
`%LOCALAPPDATA%\Launcher\updater.json`.

## Where Launcher keeps its data

| What | Path |
| --- | --- |
| Tasks, sessions, transcripts | `%LOCALAPPDATA%\Launcher\app.db` |
| Attachments and blobs | `%LOCALAPPDATA%\Launcher\blobs` |
| Settings | `%USERPROFILE%\.launcher\app.json` |

Unpacking a new release over the old directory leaves all of it untouched.

## Agent CLIs

Launcher detects the provider CLIs on `PATH` and, because a fresh `PATH` may
predate an install, also looks in the usual per-user prefixes:
`%APPDATA%\npm`, `%USERPROFILE%\.bun\bin`, `%USERPROFILE%\.cargo\bin`,
`%USERPROFILE%\scoop\shims`, and `%LOCALAPPDATA%\Microsoft\WindowsApps`.

Bare names resolve through `PATHEXT`, so the `claude.cmd` shim npm installs is
found the same way `claude` would be in a shell. Nothing is spawned with a
console window attached.

If a CLI is installed but not detected, set its path explicitly in
**Settings → Providers**.

## Terminal

The built-in terminal opens PowerShell 7 (`pwsh.exe`) when it is installed,
then Windows PowerShell, then whatever `COMSPEC` names. Ctrl+Shift+C and
Ctrl+Shift+V copy and paste so Ctrl+C stays available to the shell.

## Browser

The right panel's Browser tab runs on WebView2, which is in-box on Windows 11
and evergreen-installed on Windows 10. Navigation, devtools, downloads, and
pop-up handling behave as they do on macOS.

Launcher hosts it in *visual* mode rather than as a child window: the page renders
into a DirectComposition visual that GPUI hands out between its own content
and its overlay plane, so menus, tooltips and dialogs composite above a live
page instead of hiding it. That is also why the browser needs a working
composition path — see the black-window note under Troubleshooting.

Differences worth knowing:

- **No load progress in the toolbar.** WebView2 reports no equivalent of
  WebKit's `estimatedProgress`, so the bar stays empty while a page loads.
- **Devtools open but do not toggle.** WebView2 offers no way to ask whether
  its devtools window is open, or to close it, so the shortcut only opens and
  refocuses it.
- **Pen, touch and dragging files into the page are not wired up.** Visual
  hosting delivers no input of its own; Launcher forwards mouse, wheel, cursor and
  focus, and leaves `SendPointerInput` and the external drop target for later.
  Keyboard and IME are unaffected — those still reach the page directly once
  it holds focus.

## Computer Use

Debug builds expose Computer Use for supported providers through the bundled
Cua Driver SDK. It operates within the current interactive Windows desktop;
elevated apps and secure desktops retain Windows restrictions. See
[Computer Use](computer-use.md) for the runtime, packaging, and validation.

## What is not available yet

- **Terminals over the daemon's browser client.** The desktop terminal works;
  a remote browser client connected to a Windows daemon cannot open one.

## Troubleshooting

**The window opens black, or the app exits at startup.** Launcher needs a working
Direct3D 11 device. Update the GPU driver; in a VM, enable 3D acceleration.

**A provider is listed as not installed.** Open a new PowerShell window and run
the CLI by name. If the shell cannot find it either, the install did not put a
shim on `PATH`. If the shell finds it but Launcher does not, set the binary path in
**Settings → Providers** and file an issue with the install method.

**Git-backed features do nothing.** Launcher shells out to `git`. Install Git for
Windows and make sure `git --version` works in a new terminal.

**Check for Updates does nothing.** This fork does not publish an update feed.
Download a newer installer from the GitHub release page and run it.
