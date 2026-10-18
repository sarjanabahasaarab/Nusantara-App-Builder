// Nusantara App Builder - Native Plugin Security & Sandbox Subsystem (Rust)
// Permission verification and isolation between third-party plugins and raw OS capabilities.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginPermissionRequest {
    pub plugin_id: String,
    pub permissions: Vec<String>,
}

pub struct PluginSandbox;

impl PluginSandbox {
    /// Validates whether a plugin is attempting to request critical unallowed permissions
    pub fn audit_permissions(requested: &[String]) -> (Vec<String>, bool) {
        let mut warnings = Vec::new();
        let mut requires_explicit_prompt = false;

        for perm in requested {
            if perm == "process.execute" || perm == "android.build" {
                warnings.push(format!("Izin berisiko tinggi diminta: {}", perm));
                requires_explicit_prompt = true;
            } else if perm == "filesystem.write" {
                warnings.push("Izin penulisan berkas diminta".to_string());
                requires_explicit_prompt = true;
            }
        }

        (warnings, requires_explicit_prompt)
    }
}
