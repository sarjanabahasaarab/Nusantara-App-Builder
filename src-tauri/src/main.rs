// Nusantara App Builder - Windows Desktop IDE (Phase 1)
// Entry point for Tauri desktop runtime

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    nusantara_app_builder::run();
}
