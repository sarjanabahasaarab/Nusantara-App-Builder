// Nusantara App Builder - Tauri IPC Command Gateway (Rust)
// Modular router connecting React Frontend with Native Rust Subsystems.

use serde::{Deserialize, Serialize};
use crate::android::{AndroidToolchain, JdkInfo, SdkInfo};
use crate::build::{BuildEngine, NativeBuildResult};
use crate::filesystem::FilesystemManager;
use crate::security::SecurityManager;

#[tauri::command]
pub fn validate_project_path(path: &str) -> Result<bool, String> {
    SecurityManager::validate_path(path)
}

#[tauri::command]
pub fn detect_android_sdk(custom_path: Option<String>) -> SdkInfo {
    AndroidToolchain::detect_sdk(custom_path)
}

#[tauri::command]
pub fn detect_jdk(custom_path: Option<String>) -> JdkInfo {
    AndroidToolchain::detect_jdk(custom_path)
}

#[tauri::command]
pub fn create_project_directory(location: &str, project_name: &str) -> Result<String, String> {
    FilesystemManager::create_project_directory(location, project_name)
}

#[tauri::command]
pub fn delete_project_directory_permanently(full_path: &str) -> Result<bool, String> {
    FilesystemManager::delete_project_directory(full_path)
}

#[tauri::command]
pub fn write_project_metadata_atomic(full_dir_path: &str, json_content: &str) -> Result<bool, String> {
    FilesystemManager::write_metadata_atomic(full_dir_path, json_content)
}

#[tauri::command]
pub fn run_gradle_task(project_dir: &str, task_args: Vec<String>) -> Result<NativeBuildResult, String> {
    BuildEngine::run_task(project_dir, task_args)
}
