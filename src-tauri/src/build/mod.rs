// Nusantara App Builder - Native Build Engine Subsystem (Rust)
// Safe Gradle process execution using strict argument arrays without shell interpolation.

use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;
use std::time::Instant;
use crate::security::SecurityManager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NativeBuildResult {
    pub success: bool,
    pub exit_code: i32,
    pub duration_ms: u64,
    pub logs: Vec<String>,
    pub artifact_path: Option<String>,
    pub error_summary: Option<String>,
}

pub struct BuildEngine;

impl BuildEngine {
    pub fn run_task(project_dir: &str, task_args: Vec<String>) -> Result<NativeBuildResult, String> {
        SecurityManager::validate_path(project_dir)?;
        let p = Path::new(project_dir);

        if !p.exists() || !p.is_dir() {
            return Err("Direktori proyek tidak ditemukan".to_string());
        }

        // Determine gradlew wrapper binary
        #[cfg(target_os = "windows")]
        let gradlew_path = p.join("gradlew.bat");
        #[cfg(not(target_os = "windows"))]
        let gradlew_path = p.join("gradlew");

        if !gradlew_path.exists() {
            return Err("Berkas gradlew wrapper tidak ditemukan dalam proyek".to_string());
        }

        let start_time = Instant::now();

        // Whitelist safe Gradle commands to prevent command injection
        for arg in &task_args {
            if arg.contains(';') || arg.contains('&') || arg.contains('|') || arg.contains('`') {
                return Err("Karakter tidak aman terdeteksi dalam argumen perintah".to_string());
            }
        }

        let output = Command::new(&gradlew_path)
            .args(&task_args)
            .current_dir(p)
            .output()
            .map_err(|e| format!("Gagal menjalankan proses Gradle: {}", e))?;

        let duration = start_time.elapsed().as_millis() as u64;
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        let mut logs = Vec::new();
        for line in stdout.lines().chain(stderr.lines()) {
            logs.push(SecurityManager::mask_sensitive_data(line));
        }

        let exit_code = output.status.code().unwrap_or(-1);
        let success = output.status.success();

        // Check for generated artifact
        let mut artifact_path = None;
        let apk_debug = p.join("app/build/outputs/apk/debug/app-debug.apk");
        let apk_release = p.join("app/build/outputs/apk/release/app-release.apk");
        let aab_release = p.join("app/build/outputs/bundle/release/app-release.aab");

        if apk_debug.exists() {
            artifact_path = Some(apk_debug.to_string_lossy().to_string());
        } else if apk_release.exists() {
            artifact_path = Some(apk_release.to_string_lossy().to_string());
        } else if aab_release.exists() {
            artifact_path = Some(aab_release.to_string_lossy().to_string());
        }

        Ok(NativeBuildResult {
            success,
            exit_code,
            duration_ms: duration,
            logs,
            artifact_path,
            error_summary: if success { None } else { Some("Kompilasi Gradle gagal. Periksa log detail.".to_string()) },
        })
    }
}
