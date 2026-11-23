# Releasing Launcher

Launcher can ship signed in-app updates on macOS, Linux, and Windows once you
publish them yourself. Do not publish to Waku's host, `releases.waku.sh`, and
do not sign with Waku's Sparkle key. The copy of `SUPublicEDKey` in
`resources/Info.plist` is still Waku's public key, and `SUFeedURL` is unset so
the app does not download Waku archives. Generate a new key, replace
`SUPublicEDKey`, set a feed you control, and set `LAUNCHER_DOWNLOAD_URL_PREFIX`
before turning updates on. macOS uses
[Sparkle](https://sparkle-project.org), including binary deltas when available;
the native Linux and Windows updaters read architecture-specific feeds and
verify artifacts with the same EdDSA key. One release workflow produces all
platform artifacts and feeds.

Once set up, cutting a release is:

```sh
bun run release
```

- Updater code: [`src/updater.rs`](src/updater.rs) — loads the embedded
  Sparkle.framework on macOS and owns the signed native flows on Linux and
  Windows. Available updates appear in the sidebar footer; **Check for
  Updates…** lives in the app menu, and **Automatic updates** lives in
  Settings → General.
- Feed URL + public key: [`resources/Info.plist`](resources/Info.plist)
  (`SUFeedURL`, `SUPublicEDKey`).
- Framework embedding + pinned Sparkle version:
  [`scripts/bundle.sh`](scripts/bundle.sh) (bump `sparkle_version` and
  `sparkle_sha256` together; the distribution is cached under
  `.launcher-cache/sparkle/`).
- Release automation: [`scripts/release.ts`](scripts/release.ts),
  [`scripts/appcast.ts`](scripts/appcast.ts),
  [`scripts/changelog.ts`](scripts/changelog.ts).
- GitHub Actions: [`.github/workflows/release.yml`](.github/workflows/release.yml)
  builds Linux (x86_64, arm64), Windows (x86_64, arm64), and macOS archives on
  a `v*` tag — or on a manual **Run workflow**, which takes the version from
  `Cargo.toml` — and opens a draft GitHub release. Publishing that draft is
  the download location.

---

## One-time setup

The release runs on [Bun](https://bun.sh) and needs
[`create-dmg`](https://github.com/create-dmg/create-dmg)
(`brew install bun create-dmg`).

### 1. Sparkle signing keys

Updates are signed with an ed25519 key; the private half stays in the login
keychain and the public half ships in Info.plist as `SUPublicEDKey`.

Generate a new key for Launcher. The public key currently in Info.plist belongs
to Waku; leaving it in place means only archives signed by that key will verify.

On the release machine, use the Sparkle tools (they land in
`.launcher-cache/sparkle/<version>/bin` after any build, or download the release
from [sparkle-project/Sparkle](https://github.com/sparkle-project/Sparkle/releases)):

```sh
./bin/generate_keys -f sparkle_private_key.txt   # import the backed-up key
./bin/generate_keys -p                            # prints the public key — must
                                                  # match SUPublicEDKey
```

> ⚠️ Lose the private key and existing installs can never update again. Keep
> the backup current.

To split Launcher onto its own key later: `generate_keys --account launcher`, put the
new public key in Info.plist, and pass `--account launcher` through to
`generate_appcast` in `scripts/appcast.ts`. Users on old builds only trust the
old key, so do this on a release that still signs with the old key… in other
words, don't do it casually.

### 2. Developer ID signing + notarization

Copy `.env.example` to `.env` and replace the signing and analytics
placeholders. Bun loads these values before Cargo compiles the release, so the
analytics endpoint and website ID are embedded in the executable. The script
notarizes with the `NOTARY` keychain profile by default. On a fresh machine:

```sh
cp .env.example .env
xcrun notarytool store-credentials NOTARY \
  --apple-id you@example.com --team-id YOUR_APPLE_TEAM_ID
```

Override the environment with `--signing-identity`, or change the notary
profile with `--notary-profile` / `LAUNCHER_NOTARY_PROFILE`.

### 3. GitHub Releases

There is no separate download site. The Release workflow attaches every
artifact to a draft GitHub Release. Publishing the draft makes those files
the public downloads, at
`https://github.com/Lakphy/launcher/releases/download/v<version>/`.

---

## Cutting a release

1. **Bump `version` in `Cargo.toml`** — the single source of truth.
   `CFBundleShortVersionString` is the version, and `CFBundleVersion` is
   derived from it (`major*1e6 + minor*1e3 + patch`, so `0.2.0` → `2000`),
   which keeps Sparkle's build-number comparison monotonic without a manual
   counter. Prerelease versions (`-beta.1`) are refused for publishing — the
   appcast serves one stable channel.
2. **Write the release notes** — add a `## [<version>]` section at the top of
   [`CHANGELOG.md`](CHANGELOG.md).
3. **Run it:**
   ```sh
   bun run release
   ```

The script builds and signs the app via `scripts/bundle.sh release`, verifies
the bundled JS REPL and computer-use helper, builds the styled DMG, notarizes
and staples DMG + app, zips the app for Sparkle, attaches the changelog
section as release notes, and writes a signed
`appcast.xml` under `dist/`. Attach those files to the GitHub Release. When
it finishes:

- **Download link**: `https://github.com/Lakphy/launcher/releases/download/v<version>/Launcher-<version>.dmg`
- **In-app updates**: the same release's appcast, after `SUFeedURL` and the
  Linux and Windows feed constants point there.

Test by keeping an older build around, launching it, and choosing
**Check for Updates…**.

### GitHub draft release

The Release workflow runs two ways:

- **Push a `v*` tag** — the tag must match the `version` in `Cargo.toml`, or the
  run fails before anything builds.
- **Actions → Release → Run workflow** — no tag needed. The run releases
  whatever `Cargo.toml` says and drafts it as `v<version>`; that tag is created
  at the built commit when you publish the draft.

macOS CI runs `bun run release --local`, which signs, notarizes, and writes the
same artifacts as a local release:

- `Launcher-<version>.dmg`
- `Launcher-<version>.zip`
- `appcast.xml` (Sparkle-signed)

Linux CI adds:

- `launcher-<version>-x86_64-unknown-linux-gnu.tar.gz`
- `launcher-<version>-aarch64-unknown-linux-gnu.tar.gz`
- `appcast-linux-x86_64.xml`, `appcast-linux-aarch64.xml`
- `latest-linux.txt` — the version `scripts/install-linux.sh` resolves "latest" to

Windows CI adds:

- `Launcher-<version>-x86_64-Setup.exe`
- `Launcher-<version>-aarch64-Setup.exe`
- `launcher-<version>-x86_64-pc-windows-msvc.zip` (portable)
- `launcher-<version>-aarch64-pc-windows-msvc.zip` (portable)
- `appcast-windows-x86_64.xml`, `appcast-windows-aarch64.xml`
- `latest-windows.txt` — the version the download page resolves "latest" to

[`scripts/bundle-windows.ts`](scripts/bundle-windows.ts) builds both, driving
[`resources/windows/launcher.iss`](resources/windows/launcher.iss) through Inno Setup's
`ISCC`. The installer is **per-user** (`PrivilegesRequired=lowest`,
`%LOCALAPPDATA%\Programs\Launcher`) — no elevation, which is exactly what lets the
updater re-run it silently. The script signs the two executables and the
installer with Authenticode when `WINDOWS_CERTIFICATE` and
`WINDOWS_CERTIFICATE_PASSWORD` are set, and packages them unsigned otherwise,
so a fork without a certificate can still cut a release at the cost of a
SmartScreen warning.

**Never change `AppId` in `launcher.iss`.** It is how Windows recognizes an
existing install; a new one turns every update into a second copy in
Add/Remove Programs.

#### The native Windows and Linux update feeds

Windows and Linux have no Sparkle, so [`src/updater.rs`](src/updater.rs) runs
the same contract itself: fetch the appcast, compare versions, download, and
verify the EdDSA signature. Windows hands the installer to Inno Setup with
`/SILENT`. Linux safely unpacks the tarball beside the managed user-local
prefix, then `launcher-updater` swaps it after the app's normal quit saves and
rolls back if the replacement cannot open its main window.

- **One feed per architecture.** A Sparkle appcast cannot say which binary an
  item is for, and the client picks its feed at compile time.
- **Same key as macOS.** `build.rs` reads `SUPublicEDKey` out of
  `resources/Info.plist` and compiles it in, so the three platforms cannot
  drift onto different keys.
- [`scripts/appcast-windows.ts`](scripts/appcast-windows.ts) and
  [`scripts/appcast-linux.ts`](scripts/appcast-linux.ts) sign the feeds in the
  draft-release job — the only one holding all native artifacts. They sign
  with Node's Ed25519 over the same `SPARKLE_PRIVATE_KEY`, and refuse to run
  when the key does not derive `SUPublicEDKey` (signing with the wrong key
  ships a feed the app rejects).
- Each feed contains the artifacts from this run. Older releases stay
  downloadable as their own GitHub Release assets.

Both Linux jobs run on **Ubuntu 22.04**, and that choice is load-bearing: the
binaries link against the build machine's glibc, so the runner sets the oldest
distribution Launcher can start on (2.35 — Ubuntu 22.04, Debian 12, Fedora 36).
Moving those jobs to a newer runner silently drops support for everything
older.

The workflow opens (or updates) a **draft** GitHub release with those files and
the matching `CHANGELOG.md` section. Publishing the draft makes the assets
public on GitHub Releases.

`latest-linux.txt` is what
[`scripts/install-linux.sh`](scripts/install-linux.sh) reads from the latest
GitHub Release to choose a version. See [docs/linux.md](docs/linux.md).

Repository secrets are optional. A missing secret skips that signature and the release still publishes installers.

| Secret | When it is set |
| --- | --- |
| `LAUNCHER_SIGNING_IDENTITY` | Developer ID identity. With `APPLE_CERTIFICATE`, the macOS app is Developer ID signed. Unset means ad-hoc. |
| `APPLE_CERTIFICATE` | base64-encoded Developer ID Application `.p12` |
| `APPLE_CERTIFICATE_PASSWORD` | password for that `.p12` |
| `APPLE_ID` | Apple ID used by `notarytool`. All three notarization secrets must be set, or notarization is skipped. |
| `APPLE_APP_SPECIFIC_PASSWORD` | app-specific password for that Apple ID |
| `APPLE_TEAM_ID` | Developer Team ID |
| `SPARKLE_PRIVATE_KEY` | EdDSA private key. Unset skips the signed update feeds. |
| `LAUNCHER_ANALYTICS_ENDPOINT` | embedded only when both analytics values are set |
| `LAUNCHER_ANALYTICS_WEBSITE_ID` | embedded only when both analytics values are set |
| `WINDOWS_CERTIFICATE` | optional Authenticode `.pfx`, base64. Unset ships an unsigned Windows installer. |
| `WINDOWS_CERTIFICATE_PASSWORD` | password for that `.pfx` |
### Options

| Flag / Env | Default | Purpose |
| --- | --- | --- |
| `--local` | — | build and write artifacts locally; CI uses this |
| `--adhoc`, `--skip-notarize` | — | local test builds (imply `--local`) |
| `--skip-build` | — | reuse existing release binaries |
| `--build-number <n>` / `LAUNCHER_BUILD_NUMBER` | derived | `CFBundleVersion` override |
| `LAUNCHER_DOWNLOAD_URL_PREFIX` | GitHub release download URL | base URL written into the appcast |
| `SPARKLE_BIN` | the `.launcher-cache` copy | Sparkle tools directory |

---

## Notes

- **Two artifacts per release:** the notarized `.dmg` (what people download)
  and a `.zip` (what Sparkle installs, plus `.delta` files against recent
  builds). Only the zip family appears in the appcast; point download buttons
  at the DMG.
- **Debug builds never update themselves.** `Updater::init` returns `None`
  under `debug_assertions`, so the dev watcher's app can't offer to replace
  itself with a production Launcher. Set `LAUNCHER_FORCE_UPDATER=1` to exercise the
  real Sparkle flow from a debug bundle anyway. A bare `cargo run` binary has
  no embedded framework and also degrades to no updater. For UI-only testing,
  start the watcher with `LAUNCHER_PREVIEW_UPDATE=1`; the sidebar immediately
  shows an available update and clicking it changes to the spinner without
  installing anything. The preview flag fakes only that sidebar result;
  **Check for Updates…** still uses the embedded Sparkle framework and its
  real standard window.
- **Automatic and explicit checks have separate presentation.** Scheduled
  checks stay silent until the sidebar update button appears. Choosing
  **Check for Updates…** promotes an existing silent result into Sparkle's
  standard updater window, or shows its checking progress while an automatic
  check finishes. With no automatic session active, it starts Sparkle's
  standard user-initiated check directly.
- **First-run consent:** Sparkle shows its one-time "check automatically?"
  prompt on the second launch. The Settings → General toggle reads and writes
  the same persisted value.
- **Launcher isn't sandboxed**, so Sparkle's XPC services are unnecessary;
  `bundle.sh` strips them (plus headers/modules) from the embedded framework
  and re-signs the rest with the app's identity — hardened-runtime library
  validation requires the identities to match.
- **Old archives stay on their GitHub Release** so a previous version can
  still be downloaded. `dist/updates/` (git-ignored) only stages the version
  being built.
- **Platform artifacts** are attached to that GitHub Release. macOS names are
  `Launcher-<v>.dmg`, `Launcher-<v>.zip`, and `appcast.xml`. Linux CI produces
  `launcher-<v>-<target>.tar.gz` with `scripts/bundle-linux.sh`. Windows CI
  produces `launcher-<v>-<target>.zip` with `scripts/bundle-windows.ts` and
  `Launcher-<v>-<arch>-Setup.exe`. Each
  native client updates from `appcast-<platform>-<arch>.xml` while the Linux
  installer resolves `latest-linux.txt`. `src/updater.rs` is the per-platform
  seam, and everything
  mac-specific in the existing release pipeline lives behind the Darwin guard
  in `scripts/release.ts` plus `scripts/bundle.sh`.
