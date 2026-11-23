// Copyright (C) 2026 Lakphy.
// Launcher is a modified version of Waku (https://github.com/egoist/waku),
// modified 2026-11-23. Licensed under GPL-3.0-only. See NOTICE and LICENSE.
//
// A GUI build must not open a console window behind the app. Debug builds
// keep the console subsystem so `cargo run` and the dev watcher still see
// stdout and panics.
#![cfg_attr(
    all(target_os = "windows", not(debug_assertions)),
    windows_subsystem = "windows"
)]

fn main() {
    launcher::run();
}
