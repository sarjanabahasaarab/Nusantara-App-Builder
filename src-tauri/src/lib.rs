// Nusantara App Builder - Tauri 2.x Application Builder
pub mod commands;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::validate_project_path,
            commands::detect_android_sdk,
            commands::detect_jdk,
            commands::create_project_directory,
            commands::delete_project_directory_permanently
        ])
        .run(tauri::generate_context!())
        .expect("Gagal menjalankan aplikasi Nusantara App Builder");
}
