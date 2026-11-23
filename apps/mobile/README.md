# Launcher Mobile

Expo client for connecting to one or more remote Launcher daemons from iOS,
Android.

## Run

From the repository root:

```sh
bun install
bun --filter @launcher/mobile ios
bun --filter @launcher/mobile android
```

## Connect

In Launcher Desktop, enable the remote daemon and copy its WebSocket address and
token. Add those values in the mobile app. Use `wss://` outside a trusted LAN
or private tailnet; the token grants full control of the daemon host.

Saved profile metadata stays in app storage. On iOS and Android, daemon tokens
are stored separately in the device keychain through Expo SecureStore.

Launcher is licensed under the repository's GNU GPL v3.0-only license.
