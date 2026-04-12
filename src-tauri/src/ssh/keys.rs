use serde::{Deserialize, Serialize};
use std::fs;
use std::process::Command;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SshKey {
    pub name: String,
    pub path: String,
    pub key_type: String,
    pub public_key: Option<String>,
}

pub fn list_keys() -> Vec<SshKey> {
    let home = dirs::home_dir().unwrap_or_default();
    let ssh_dir = home.join(".ssh");

    let mut keys = vec![];

    if let Ok(entries) = fs::read_dir(&ssh_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "pub") {
                continue;
            }
            let name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();

            let pub_path = path.with_extension("pub");
            if pub_path.exists() {
                let public_key = fs::read_to_string(&pub_path).ok();
                let key_type = public_key
                    .as_ref()
                    .and_then(|k| k.split_whitespace().next())
                    .unwrap_or("unknown")
                    .to_string();

                keys.push(SshKey {
                    name,
                    path: path.to_string_lossy().to_string(),
                    key_type,
                    public_key,
                });
            }
        }
    }

    keys
}

pub fn generate_key(name: &str, key_type: &str, passphrase: &str) -> Result<SshKey, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let key_path = home.join(".ssh").join(name);

    if key_path.exists() {
        return Err(format!("Key '{}' already exists", name));
    }

    let output = Command::new("ssh-keygen")
        .args([
            "-t",
            key_type,
            "-f",
            &key_path.to_string_lossy(),
            "-N",
            passphrase,
            "-C",
            &format!("termlabs-{}", name),
        ])
        .output()
        .map_err(|e| format!("Failed to run ssh-keygen: {e}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let pub_path = key_path.with_extension("pub");
    let public_key = fs::read_to_string(&pub_path).ok();
    let detected_type = public_key
        .as_ref()
        .and_then(|k| k.split_whitespace().next())
        .unwrap_or(key_type)
        .to_string();

    Ok(SshKey {
        name: name.to_string(),
        path: key_path.to_string_lossy().to_string(),
        key_type: detected_type,
        public_key,
    })
}
