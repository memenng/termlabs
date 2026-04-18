use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use ssh2::Session;
use std::fs;
use std::net::TcpStream;
use std::path::PathBuf;
use std::time::Duration;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum AuthMethod {
    Password { password: String },
    Key { key_path: String, passphrase: Option<String> },
    Agent,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PortForward {
    pub local_port: u16,
    pub remote_host: String,
    pub remote_port: u16,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SshConnection {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_method: AuthMethod,
    pub port_forwards: Vec<PortForward>,
}

pub struct SshConnectionManager {
    connections: Mutex<Vec<SshConnection>>,
    config_path: Mutex<Option<PathBuf>>,
}

impl SshConnectionManager {
    pub fn new() -> Self {
        Self {
            connections: Mutex::new(Vec::new()),
            config_path: Mutex::new(None),
        }
    }

    pub fn init(&self, config_dir: PathBuf) {
        let path = config_dir.join("ssh_connections.json");
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(conns) = serde_json::from_str::<Vec<SshConnection>>(&data) {
                *self.connections.lock() = conns;
            }
        }
        *self.config_path.lock() = Some(path);
    }

    fn save(&self) {
        if let Some(path) = self.config_path.lock().as_ref() {
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let data =
                serde_json::to_string_pretty(&*self.connections.lock()).unwrap_or_default();
            if fs::write(path, data).is_ok() {
                // Restrict to owner-only (0600) since this file may contain passwords
                // and key passphrases. No-op on Windows.
                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;
                    let _ = fs::set_permissions(path, fs::Permissions::from_mode(0o600));
                }
            }
        }
    }

    pub fn list(&self) -> Vec<SshConnection> {
        self.connections.lock().clone()
    }

    pub fn add(&self, conn: SshConnection) -> SshConnection {
        let mut conn = conn;
        conn.id = uuid::Uuid::new_v4().to_string();
        self.connections.lock().push(conn.clone());
        self.save();
        conn
    }

    pub fn update(&self, conn: SshConnection) -> Result<SshConnection, String> {
        let mut connections = self.connections.lock();
        let idx = connections
            .iter()
            .position(|c| c.id == conn.id)
            .ok_or("Connection not found")?;
        connections[idx] = conn.clone();
        drop(connections);
        self.save();
        Ok(conn)
    }

    pub fn remove(&self, id: &str) -> Result<(), String> {
        let mut connections = self.connections.lock();
        let idx = connections
            .iter()
            .position(|c| c.id == id)
            .ok_or("Connection not found")?;
        connections.remove(idx);
        drop(connections);
        self.save();
        Ok(())
    }

    pub fn duplicate(&self, id: &str) -> Result<SshConnection, String> {
        let connections = self.connections.lock();
        let original = connections
            .iter()
            .find(|c| c.id == id)
            .ok_or("Connection not found")?
            .clone();
        drop(connections);

        let mut copy = original;
        copy.id = uuid::Uuid::new_v4().to_string();
        copy.name = format!("{} (copy)", copy.name);
        self.connections.lock().push(copy.clone());
        self.save();
        Ok(copy)
    }

    pub fn test_connection(conn: &SshConnection) -> Result<bool, String> {
        let addr = format!("{}:{}", conn.host, conn.port);
        let tcp = TcpStream::connect_timeout(
            &addr
                .parse()
                .map_err(|e| format!("Invalid address: {e}"))?,
            Duration::from_secs(5),
        )
        .map_err(|e| format!("TCP connection failed: {e}"))?;

        let mut session = Session::new().map_err(|e| format!("SSH session error: {e}"))?;
        session.set_tcp_stream(tcp);
        session
            .handshake()
            .map_err(|e| format!("SSH handshake failed: {e}"))?;

        match &conn.auth_method {
            AuthMethod::Password { password } => {
                session
                    .userauth_password(&conn.username, password)
                    .map_err(|e| format!("Password auth failed: {e}"))?;
            }
            AuthMethod::Key {
                key_path,
                passphrase,
            } => {
                let path = PathBuf::from(key_path);
                session
                    .userauth_pubkey_file(
                        &conn.username,
                        None,
                        &path,
                        passphrase.as_deref(),
                    )
                    .map_err(|e| format!("Key auth failed: {e}"))?;
            }
            AuthMethod::Agent => {
                let mut agent = session
                    .agent()
                    .map_err(|e| format!("SSH agent error: {e}"))?;
                agent
                    .connect()
                    .map_err(|e| format!("Agent connect failed: {e}"))?;
                agent
                    .list_identities()
                    .map_err(|e| format!("Agent list identities failed: {e}"))?;

                let identities = agent.identities().map_err(|e| format!("Agent error: {e}"))?;
                let mut authenticated = false;
                for identity in identities {
                    if agent.userauth(&conn.username, &identity).is_ok() {
                        authenticated = true;
                        break;
                    }
                }
                if !authenticated {
                    return Err("Agent authentication failed: no valid identity".to_string());
                }
            }
        }

        Ok(session.authenticated())
    }
}
