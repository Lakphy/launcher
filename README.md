# Launcher

Launcher is a modified version of [Waku](https://github.com/egoist/waku) by egoist
and contributors. Lakphy modified it on 2026-11-23. The original work and these
modifications are licensed under the GNU GPL v3.0 only. See [NOTICE](NOTICE)
and [LICENSE](LICENSE). There is no warranty.

Launcher is a fast, native desktop app for working with local coding agents. It is
built in Rust with [GPUI](https://github.com/zed-industries/zed/tree/main/crates/gpui)
and keeps projects, sessions, transcripts on your machine.

## Install

Source and release archives are published from
[github.com/Lakphy/launcher](https://github.com/Lakphy/launcher/releases).

On macOS, download the `.dmg` from that page when a release is published.
In-app updates stay off until this fork publishes its own appcast and signing key.

On Linux, install a tarball with `website/public/install.sh`. Set
`LAUNCHER_BUNDLE_PATH` to a local archive, or `LAUNCHER_RELEASES_URL` to an
HTTPS directory that hosts the archives. The script installs into `~/.local`
without root. See [docs/linux.md](docs/linux.md).

On Windows, run `Launcher-<version>-<arch>-Setup.exe` from the
[latest release](https://github.com/Lakphy/launcher/releases/latest). It installs
per-user and updates itself. A portable `.zip` is published alongside it. See
[docs/windows.md](docs/windows.md) for requirements and what is not available
there yet.

## Supported agents

Launcher works with:

- [Amp](https://ampcode.com/)
- Claude Code
- Codex CLI
- Cursor CLI
- [Fx](https://fx.sh/)
- Grok Build
- Kimi Code
- OpenCode
- Pi

Install and authenticate at least one supported agent CLI before starting Launcher.
Launcher detects available CLIs automatically and uses each provider's native
structured protocol and session continuity.

## Highlights

- Keep projects and independent agent sessions in one native app.
- Switch models, reasoning effort, and access modes from a shared interface.
- Queue or steer follow-up messages while an agent is working.
- Rewind Git-backed tasks with conversation-aware checkpoints.
- Store app state locally, with no Launcher account or remote service required.

## Architecture

The native desktop is an RPC client of the standalone `launcher-daemon` process.
Provider sessions run in [`launcher-core`](crates/launcher-core), behind the
authenticated, versioned WebSocket contract in
[`launcher-protocol`](crates/launcher-protocol). Launcher Desktop depends on
[`launcher-client`](crates/launcher-client), not on the daemon implementation. The
daemon owns task SQLite data, uploaded attachments, provider-native session
forks, and all workspace filesystem and Git operations; paths returned by it
always refer to the daemon host. The desktop retains only presentation state
and a disposable preview cache.

The browser client lives at [`apps/web`](apps/web) and uses the generated
browser transport in [`packages/launcher-client`](packages/launcher-client). Its
checked-in types are generated directly from the Rust protocol, while its
WebSocket client implements the same handshake, request IDs, subscriptions,
sequence deduplication, and replay cursors as the Rust client. Run
`bun run protocol:generate` after changing a wire type and
`bun run protocol:check` to verify that generated files are current.

Projectless task workspaces live on the daemon host under
`~/.launcher/projects/<date>/<slug>`. The daemon moves workspaces created by the
older `~/.launcher/<date>/<slug>` layout on first load.

Configuration ownership is separate too: the Release desktop writes
`~/.launcher/app.json`, while Debug stays isolated at `temp/app.json`. Daemon
provider and Computer Use settings live in `~/.launcher/settings.json`. The
desktop's Settings → Daemon page can explicitly
expose the child daemon on a fixed port, configure exact browser origins, and
copy its stable authentication token. It remains loopback-only by default.

When connected to a daemon managed outside the desktop process, Launcher never
interprets daemon paths on the client machine. The local folder picker and PTY
are therefore unavailable until the protocol gains daemon-host picker and
terminal-stream endpoints; files, diffs, Git, skills, usage, task state, and
attachments already use daemon RPC.

Release apps bundle and sign `launcher-daemon`. Development keeps the daemon at
`target/debug/launcher-debug-daemon`, allowing provider-only edits to rebuild and
replace the daemon without relaunching Launcher Debug.

## Development

Development is supported on macOS, Linux, and Windows and requires
[Rust 1.96 or newer](https://www.rust-lang.org/tools/install) and
[Bun](https://bun.sh/). Linux supports both Wayland and X11, and Windows needs
the MSVC toolchain; install the native build prerequisites listed in
[CONTRIBUTING.md](CONTRIBUTING.md) first.

```sh
bun install
bun run dev
```

The embedded browser and experimental computer-use integration currently
remain macOS-only. Agent sessions, projects, transcripts, skills, usage,
diffs, file editing, and the terminal run natively on Linux and Windows.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and checks.
Release maintainers should also read [RELEASING.md](RELEASING.md).

## Upstream

Launcher is a modified version of [Waku](https://github.com/egoist/waku).
The name Waku remains with egoist and the Waku contributors.

## License

Launcher is licensed under the [GNU General Public License v3.0 only](LICENSE).
Copyright (C) 2026 Lakphy for the modifications. Copyright (C) 2026 egoist and
the Waku contributors for the original work. There is no warranty.
