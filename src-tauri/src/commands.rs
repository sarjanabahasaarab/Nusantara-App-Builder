// Nusantara App Builder - Tauri IPC Commands (Phase 2)
// Native safe filesystem, validation, toolchain detection, and restricted Gradle process runner in Rust

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SdkInfo {
    pub is_available: bool,
    pub path: String,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JdkInfo {
    pub is_available: bool,
    pub path: String,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RustProjectMetadata {
    pub id: String,
    pub name: String,
    pub display_name: String,
    pub package_id: String,
    pub location: String,
    pub description: String,
    pub template: String,
    pub version_code: i32,
    pub version_name: String,
    pub min_sdk: i32,
    pub target_sdk: i32,
    pub compile_sdk: i32,
    pub target_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub format_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NativeBuildResult {
    pub success: bool,
    pub exit_code: i32,
    pub duration_ms: u64,
    pub logs: Vec<String>,
    pub artifact_path: Option<String>,
    pub error_summary: Option<String>,
}

/// Validates path to prevent directory traversal and illegal path sequences
#[tauri::command]
pub fn validate_project_path(path: &str) -> Result<bool, String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("Jalur tidak boleh kosong".to_string());
    }
    if trimmed.contains("..") {
        return Err("Direktori traversal (..) dilarang demi keamanan".to_string());
    }
    let p = Path::new(trimmed);
    if !p.is_absolute() {
        return Err("Jalur proyek harus berupa jalur absolut".to_string());
    }
    Ok(true)
}

/// Detects Android SDK path from custom parameter, environment variable, or default Windows location
#[tauri::command]
pub fn detect_android_sdk(custom_path: Option<String>) -> SdkInfo {
    if let Some(ref cp) = custom_path {
        let p = Path::new(cp);
        if p.exists() && p.is_dir() {
            return SdkInfo {
                is_available: true,
                path: cp.clone(),
                version: Some("API 34 (Android 14)".to_string()),
            };
        }
    }

    if let Ok(env_path) = std::env::var("ANDROID_HOME") {
        let p = Path::new(&env_path);
        if p.exists() && p.is_dir() {
            return SdkInfo {
                is_available: true,
                path: env_path,
                version: Some("API 34 (Android 14)".to_string()),
            };
        }
    }

    if let Ok(local_appdata) = std::env::var("LOCALAPPDATA") {
        let default_sdk = PathBuf::from(local_appdata).join("Android").join("Sdk");
        if default_sdk.exists() && default_sdk.is_dir() {
            return SdkInfo {
                is_available: true,
                path: default_sdk.to_string_lossy().to_string(),
                version: Some("API 34 (Android 14)".to_string()),
            };
        }
    }

    SdkInfo {
        is_available: false,
        path: custom_path.unwrap_or_default(),
        version: None,
    }
}

/// Detects Java Development Kit (JAVA_HOME)
#[tauri::command]
pub fn detect_jdk() -> JdkInfo {
    if let Ok(java_home) = std::env::var("JAVA_HOME") {
        let p = Path::new(&java_home);
        if p.exists() && p.is_dir() {
            return JdkInfo {
                is_available: true,
                path: java_home,
                version: Some("OpenJDK 17 / 21 LTS".to_string()),
            };
        }
    }

    JdkInfo {
        is_available: false,
        path: String::new(),
        version: None,
    }
}

/// Creates project directory safely after validation
#[tauri::command]
pub fn create_project_directory(path: &str) -> Result<bool, String> {
    validate_project_path(path)?;
    let p = Path::new(path);
    if p.exists() {
        return Err("Direktori proyek sudah ada".to_string());
    }
    fs::create_dir_all(p).map_err(|e| format!("Gagal membuat direktori: {}", e))?;
    Ok(true)
}

/// Permanently deletes project directory
#[tauri::command]
pub fn delete_project_directory_permanently(path: &str) -> Result<bool, String> {
    validate_project_path(path)?;
    let p = Path::new(path);
    if !p.exists() {
        return Err("Direktori proyek tidak ditemukan".to_string());
    }
    fs::remove_dir_all(p).map_err(|e| format!("Gagal menghapus direktori: {}", e))?;
    Ok(true)
}

/// Writes project metadata file atomically using a temporary file
#[tauri::command]
pub fn write_project_metadata_atomic(
    file_path: &str,
    metadata: RustProjectMetadata,
) -> Result<(), String> {
    validate_project_path(file_path)?;
    let target = Path::new(file_path);
    let tmp_path = format!("{}.tmp", file_path);

    let serialized = serde_json::to_string_pretty(&metadata)
        .map_err(|e| format!("Gagal memformat metadata JSON: {}", e))?;

    fs::write(&tmp_path, serialized)
        .map_err(|e| format!("Gagal menulis berkas sementara: {}", e))?;

    fs::rename(&tmp_path, target)
        .map_err(|e| format!("Gagal menyimpan berkas atomik: {}", e))?;

    Ok(())
}

/// Executes restricted Gradle task using separate argument vector (NO SHELL STRING CONCATENATION)
#[tauri::command]
pub fn run_gradle_task(
    project_dir: &str,
    task: &str,
    extra_args: Vec<String>,
) -> Result<NativeBuildResult, String> {
    validate_project_path(project_dir)?;

    // Whitelist permitted tasks for security
    let allowed_tasks = ["assembleDebug", "assembleRelease", "check", "clean"];
    if !allowed_tasks.contains(&task) {
        return Err(format!("Tugas Gradle '{}' tidak diizinkan demi keamanan", task));
    }

    let p = Path::new(project_dir);
    if !p.exists() || !p.is_dir() {
        return Err("Direktori proyek tidak ditemukan di sistem".to_string());
    }

    // Determine executable (gradlew.bat on Windows, gradlew on Unix)
    let is_windows = cfg!(target_os = "windows");
    let executable_name = if is_windows { "gradlew.bat" } else { "./gradlew" };
    let gradlew_path = p.join(executable_name);

    let start = std::time::Instant::now();

    // Build separate argument vector (secure against injection)
    let mut args: Vec<String> = vec![task.to_string(), "--stacktrace".to_string(), "--no-daemon".to_string()];
    for extra in extra_args {
        // Only accept safe option flags
        if extra.starts_with("--") && !extra.contains(' ') {
            args.push(extra);
        }
    }

    // Execute with validated working directory
    let mut cmd = if gradlew_path.exists() {
        Command::new(&gradlew_path)
    } else {
        Command::new("gradle")
    };

    cmd.current_dir(p);
    cmd.args(&args);

    let output = match cmd.output() {
        Ok(out) => out,
        Err(e) => {
            return Ok(NativeBuildResult {
                success: false,
                exit_code: 1,
                duration_ms: start.elapsed().as_millis() as u64,
                logs: vec![format!("Gagal mengeksekusi Gradle wrapper: {}", e)],
                artifact_path: None,
                error_summary: Some(e.to_string()),
            });
        }
    };

    let duration_ms = start.elapsed().as_millis() as u64;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    let mut logs: Vec<String> = stdout.lines().map(|s| s.to_string()).collect();
    if !stderr.is_empty() {
        logs.push("[STDERR]".to_string());
        for line in stderr.lines() {
            logs.push(line.to_string());
        }
    }

    let success = output.status.success();
    let exit_code = output.status.code().unwrap_or(-1);

    let apk_path = if success && task == "assembleDebug" {
        Some(p.join("app/build/outputs/apk/debug/app-debug.apk").to_string_lossy().to_string())
    } else {
        None
    };

    Ok(NativeBuildResult {
        success,
        exit_code,
        duration_ms,
        logs,
        artifact_path: apk_path,
        error_summary: if success { None } else { Some("Gradle build task failed".to_string()) },
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_path_validation_rejects_empty() {
        assert!(validate_project_path("").is_err());
        assert!(validate_project_path("   ").is_err());
    }

    #[test]
    fn test_path_validation_rejects_traversal() {
        assert!(validate_project_path("/home/user/../etc").is_err());
        assert!(validate_project_path("C:\\Projects\\..\\Windows").is_err());
    }

    #[test]
    fn test_path_validation_rejects_relative() {
        assert!(validate_project_path("relative/path").is_err());
    }

    #[test]
    fn test_path_validation_accepts_absolute() {
        #[cfg(target_os = "windows")]
        assert!(validate_project_path("C:\\Projects\\MyApp").is_ok());

        #[cfg(not(target_os = "windows"))]
        assert!(validate_project_path("/home/developer/projects/myapp").is_ok());
    }

    #[test]
    fn test_metadata_serialization() {
        let meta = RustProjectMetadata {
            id: "proj_123".to_string(),
            name: "TestApp".to_string(),
            display_name: "Test App".to_string(),
            package_id: "com.test.app".to_string(),
            location: "C:\\Projects".to_string(),
            description: "Test".to_string(),
            template: "empty-android".to_string(),
            version_code: 1,
            version_name: "1.0.0".to_string(),
            min_sdk: 26,
            target_sdk: 34,
            compile_sdk: 34,
            target_url: None,
            created_at: "2026-10-12T00:00:00Z".to_string(),
            updated_at: "2026-10-12T00:00:00Z".to_string(),
            format_version: "2.0".to_string(),
        };

        let json = serde_json::to_string(&meta).unwrap();
        assert!(json.contains("com.test.app"));
        assert!(json.contains("2.0"));
    }
}
