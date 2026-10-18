// Nusantara App Builder - Native Security Subsystem (Rust)
// Enforces path traversal prevention, command argument array whitelisting, and secret masking.

use std::path::Path;

pub struct SecurityManager;

impl SecurityManager {
    /// Validates path to prevent directory traversal (..) and illegal path sequences
    pub fn validate_path(path: &str) -> Result<bool, String> {
        let trimmed = path.trim();
        if trimmed.is_empty() {
            return Err("Jalur path tidak boleh kosong".to_string());
        }
        if trimmed.contains("..") {
            return Err("Direktori traversal (..) dilarang demi keamanan sistem".to_string());
        }
        let p = Path::new(trimmed);
        if !p.is_absolute() {
            return Err("Jalur proyek harus berupa jalur absolut".to_string());
        }
        Ok(true)
    }

    /// Masks passwords, keystore secrets, and tokens from terminal logs
    pub fn mask_sensitive_data(log: &str) -> String {
        let patterns = [
            ("keyPassword=", "keyPassword=********"),
            ("storePassword=", "storePassword=********"),
            ("password=", "password=********"),
            ("token=", "token=********"),
        ];

        let mut sanitized = log.to_string();
        for (pat, repl) in patterns {
            if sanitized.contains(pat) {
                let parts: Vec<&str> = sanitized.split(pat).collect();
                if parts.len() > 1 {
                    let mut result = parts[0].to_string();
                    for part in &parts[1..] {
                        let end_idx = part.find(' ').or_else(|| part.find('\n')).unwrap_or(part.len());
                        result.push_str(repl);
                        result.push_str(&part[end_idx..]);
                    }
                    sanitized = result;
                }
            }
        }
        sanitized
    }
}
