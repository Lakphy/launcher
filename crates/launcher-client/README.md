# launcher-client

`launcher-client` is the Rust client for `launcher-daemon`. It owns the authenticated
WebSocket handshake, request correlation, subscriptions, event sequence
deduplication, replay cursors, local-daemon supervision, and disposable client
preview caches. It depends on `launcher-protocol`, never on `launcher-core`.

Both bare socket addresses and complete `ws://` or `wss://` URLs are accepted.
Dropping a connection to an externally managed daemon does not stop it.
