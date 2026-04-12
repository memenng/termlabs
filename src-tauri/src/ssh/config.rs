use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SshHostConfig {
    pub host: String,
    pub hostname: Option<String>,
    pub user: Option<String>,
    pub port: Option<u16>,
    pub identity_file: Option<String>,
}

pub fn parse_ssh_config() -> Vec<SshHostConfig> {
    let home = dirs::home_dir().unwrap_or_default();
    let config_path = home.join(".ssh").join("config");
    parse_ssh_config_file(&config_path)
}

pub fn parse_ssh_config_file(path: &PathBuf) -> Vec<SshHostConfig> {
    let content = match fs::read_to_string(path) {
        Ok(c) => c,
        Err(_) => return vec![],
    };

    let mut hosts: Vec<SshHostConfig> = vec![];
    let mut current: Option<SshHostConfig> = None;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        let parts: Vec<&str> = trimmed
            .splitn(2, |c: char| c.is_whitespace() || c == '=')
            .collect();
        if parts.len() < 2 {
            continue;
        }

        let key = parts[0].trim().to_lowercase();
        let value = parts[1].trim().to_string();

        match key.as_str() {
            "host" => {
                if let Some(h) = current.take() {
                    if !h.host.contains('*') {
                        hosts.push(h);
                    }
                }
                current = Some(SshHostConfig {
                    host: value,
                    hostname: None,
                    user: None,
                    port: None,
                    identity_file: None,
                });
            }
            "hostname" => {
                if let Some(ref mut h) = current {
                    h.hostname = Some(value);
                }
            }
            "user" => {
                if let Some(ref mut h) = current {
                    h.user = Some(value);
                }
            }
            "port" => {
                if let Some(ref mut h) = current {
                    h.port = value.parse().ok();
                }
            }
            "identityfile" => {
                if let Some(ref mut h) = current {
                    h.identity_file = Some(value);
                }
            }
            _ => {}
        }
    }

    if let Some(h) = current {
        if !h.host.contains('*') {
            hosts.push(h);
        }
    }

    hosts
}
