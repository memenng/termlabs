use parking_lot::Mutex;
use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use std::collections::HashMap;
use std::io::{BufReader, Read, Write};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::thread;
use tauri::ipc::Channel;

static GENERATION: AtomicU64 = AtomicU64::new(0);

pub struct PtySession {
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    generation: u64,
}

pub struct PtyManager {
    sessions: Arc<Mutex<HashMap<String, PtySession>>>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn spawn(
        &self,
        id: String,
        rows: u16,
        cols: u16,
        cwd: Option<String>,
        shell: Option<String>,
        on_data: Channel<PtyEvent>,
    ) -> Result<(), String> {
        let pty_system = native_pty_system();
        let size = PtySize { rows, cols, pixel_width: 0, pixel_height: 0 };

        let pair = pty_system.openpty(size).map_err(|e| format!("Failed to open PTY: {e}"))?;

        let shell_cmd = shell.unwrap_or_else(|| {
            if cfg!(target_os = "windows") {
                "powershell.exe".to_string()
            } else {
                std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
            }
        });

        let mut cmd = CommandBuilder::new(&shell_cmd);
        cmd.env("TERM", "xterm-256color");
        if let Some(dir) = cwd {
            cmd.cwd(dir);
        }

        pair.slave.spawn_command(cmd).map_err(|e| format!("Failed to spawn command: {e}"))?;

        let reader = pair.master.try_clone_reader().map_err(|e| format!("Failed to clone reader: {e}"))?;
        let writer = pair.master.take_writer().map_err(|e| format!("Failed to take writer: {e}"))?;

        let gen = GENERATION.fetch_add(1, Ordering::SeqCst);

        let session = PtySession {
            master: Arc::new(Mutex::new(pair.master)),
            writer: Arc::new(Mutex::new(writer)),
            generation: gen,
        };

        // Remove old session if it exists (e.g., on React remount after split)
        let mut sessions = self.sessions.lock();
        sessions.remove(&id);
        sessions.insert(id.clone(), session);
        drop(sessions);

        let sessions = self.sessions.clone();
        let pty_id = id.clone();
        thread::spawn(move || {
            let mut buf_reader = BufReader::new(reader);
            let mut buf = [0u8; 4096];
            loop {
                match buf_reader.read(&mut buf) {
                    Ok(0) => {
                        // Only remove session if generation matches (prevent old thread killing new session)
                        let mut map = sessions.lock();
                        if map.get(&pty_id).map_or(false, |s| s.generation == gen) {
                            let _ = on_data.send(PtyEvent::Exit { id: pty_id.clone() });
                            map.remove(&pty_id);
                        }
                        break;
                    }
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();
                        // Silently stop if send fails (channel dead = old component unmounted)
                        if on_data.send(PtyEvent::Data { id: pty_id.clone(), data }).is_err() {
                            break;
                        }
                    }
                    Err(_) => {
                        let mut map = sessions.lock();
                        if map.get(&pty_id).map_or(false, |s| s.generation == gen) {
                            let _ = on_data.send(PtyEvent::Exit { id: pty_id.clone() });
                            map.remove(&pty_id);
                        }
                        break;
                    }
                }
            }
        });

        Ok(())
    }

    pub fn spawn_with_command(
        &self,
        id: String,
        rows: u16,
        cols: u16,
        command: String,
        args: Vec<String>,
        on_data: Channel<PtyEvent>,
    ) -> Result<(), String> {
        let pty_system = native_pty_system();
        let size = PtySize { rows, cols, pixel_width: 0, pixel_height: 0 };

        let pair = pty_system.openpty(size).map_err(|e| format!("Failed to open PTY: {e}"))?;

        let mut cmd = CommandBuilder::new(&command);
        cmd.env("TERM", "xterm-256color");
        for arg in &args {
            cmd.arg(arg);
        }

        pair.slave.spawn_command(cmd).map_err(|e| format!("Failed to spawn command: {e}"))?;

        let reader = pair.master.try_clone_reader().map_err(|e| format!("Failed to clone reader: {e}"))?;
        let writer = pair.master.take_writer().map_err(|e| format!("Failed to take writer: {e}"))?;

        let gen = GENERATION.fetch_add(1, Ordering::SeqCst);

        let session = PtySession {
            master: Arc::new(Mutex::new(pair.master)),
            writer: Arc::new(Mutex::new(writer)),
            generation: gen,
        };

        let mut sessions = self.sessions.lock();
        sessions.remove(&id);
        sessions.insert(id.clone(), session);
        drop(sessions);

        let sessions = self.sessions.clone();
        let pty_id = id.clone();
        thread::spawn(move || {
            let mut buf_reader = BufReader::new(reader);
            let mut buf = [0u8; 4096];
            loop {
                match buf_reader.read(&mut buf) {
                    Ok(0) => {
                        let mut map = sessions.lock();
                        if map.get(&pty_id).map_or(false, |s| s.generation == gen) {
                            let _ = on_data.send(PtyEvent::Exit { id: pty_id.clone() });
                            map.remove(&pty_id);
                        }
                        break;
                    }
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();
                        if on_data.send(PtyEvent::Data { id: pty_id.clone(), data }).is_err() {
                            break;
                        }
                    }
                    Err(_) => {
                        let mut map = sessions.lock();
                        if map.get(&pty_id).map_or(false, |s| s.generation == gen) {
                            let _ = on_data.send(PtyEvent::Exit { id: pty_id.clone() });
                            map.remove(&pty_id);
                        }
                        break;
                    }
                }
            }
        });

        Ok(())
    }

    pub fn get_writer(&self, id: &str) -> Result<Arc<Mutex<Box<dyn Write + Send>>>, String> {
        let sessions = self.sessions.lock();
        let session = sessions.get(id).ok_or("Session not found")?;
        Ok(session.writer.clone())
    }

    pub fn resize(&self, id: &str, rows: u16, cols: u16) -> Result<(), String> {
        if rows == 0 || cols == 0 {
            return Ok(());
        }
        let sessions = self.sessions.lock();
        let session = sessions.get(id).ok_or("Session not found")?;
        let result = session.master.lock().resize(PtySize { rows, cols, pixel_width: 0, pixel_height: 0 })
            .map_err(|e| format!("Resize failed: {e}"));
        result
    }

    pub fn close(&self, id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock();
        sessions.remove(id).ok_or("Session not found".to_string())?;
        Ok(())
    }
}

#[derive(Clone, serde::Serialize)]
#[serde(tag = "event", content = "data")]
pub enum PtyEvent {
    Data { id: String, data: String },
    Exit { id: String },
}
