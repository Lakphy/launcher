//! Shared application identity used by the daemon and desktop client.
//!
//! Copyright (C) 2026 Lakphy. Launcher is a modified version of Waku
//! (https://github.com/egoist/waku), modified 2026-11-23. GPL-3.0-only.
//! See NOTICE and LICENSE at the repository root.

#[cfg(debug_assertions)]
pub const APP_NAME: &str = "Launcher Debug";
#[cfg(not(debug_assertions))]
pub const APP_NAME: &str = "Launcher";

#[cfg(debug_assertions)]
pub const APP_ID: &str = "dev.lakphy.launcher.dev";
#[cfg(not(debug_assertions))]
pub const APP_ID: &str = "dev.lakphy.launcher";

#[cfg(debug_assertions)]
pub const DATA_DIRECTORY_NAME: &str = "Launcher Debug";
#[cfg(not(debug_assertions))]
pub const DATA_DIRECTORY_NAME: &str = "Launcher";
