// Nusantara App Builder - Native Filesystem Subsystem (Rust)
// Safe atomic writes, directory creation, recursive deletion, and project integrity checks.

use std::fs;
use std::path::{Path, PathBuf};
use crate::security::SecurityManager;

pub struct FilesystemManager;

impl FilesystemManager {
    pub fn create_project_directory(location: &str, project_name: &str) -> Result<String, String> {
        SecurityManager::validate_path(location)?;
        let project_dir = Path::new(location).join(project_name);

        if project_dir.exists() {
            return Err("Direktori proyek sudah ada pada lokasi tersebut".to_string());
        }

        fs::create_dir_all(&project_dir)
            .map_err(|e| format!("Gagal membuat direktori proyek: {}", e))?;

        Ok(project_dir.to_string_lossy().to_string())
    }

    pub fn delete_project_directory(full_path: &str) -> Result<bool, String> {
        SecurityManager::validate_path(full_path)?;
        let p = Path::new(full_path);

        if !p.exists() {
            return Ok(true);
        }

        // Must contain nusantara.project.json to avoid deleting arbitrary system folders
        let marker = p.join("nusantara.project.json");
        if !marker.exists() {
            return Err("Direktori bukan merupakan proyek Nusantara yang sah".to_string());
        }

        fs::remove_dir_all(p)
            .map_err(|e| format!("Gagal menghapus direktori proyek: {}", e))?;

        Ok(true)
    }

    pub fn write_metadata_atomic(full_dir_path: &str, json_content: &str) -> Result<bool, String> {
        SecurityManager::validate_path(full_dir_path)?;
        let dir = Path::new(full_dir_path);
        let target_file = dir.join("nusantara.project.json");
        let temp_file = dir.join("nusantara.project.json.tmp");

        fs::write(&temp_file, json_content)
            .map_err(|e| format!("Gagal menulis berkas sementara: {}", e))?;

        fs::rename(&temp_file, &target_file)
            .map_err(|e| format!("Gagal melakukan rename atomic metadata: {}", e))?;

        Ok(true)
    }
}
