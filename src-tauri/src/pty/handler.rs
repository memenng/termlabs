use crate::pty::manager::{PtyEvent, PtyManager};
use tauri::ipc::Channel;
use tauri::State;

#[tauri::command]
pub fn pty_spawn(
    manager: State<'_, PtyManager>,
    id: String,
    rows: u16,
    cols: u16,
    cwd: Option<String>,
    shell: Option<String>,
    on_data: Channel<PtyEvent>,
) -> Result<(), String> {
    manager.spawn(id, rows, cols, cwd, shell, on_data)
}

#[tauri::command]
pub fn pty_spawn_ssh(
    manager: State<'_, PtyManager>,
    id: String,
    rows: u16,
    cols: u16,
    hostname: String,
    port: u16,
    username: String,
    key_path: Option<String>,
    on_data: Channel<PtyEvent>,
) -> Result<(), String> {
    let mut args = vec!["-o".to_string(), "StrictHostKeyChecking=no".to_string()];
    if let Some(key) = key_path {
        args.extend(["-i".to_string(), key]);
    }
    args.extend(["-p".to_string(), port.to_string()]);
    args.push(format!("{}@{}", username, hostname));

    manager.spawn_with_command(id, rows, cols, "ssh".to_string(), args, on_data)
}

#[tauri::command]
pub fn pty_write(manager: State<'_, PtyManager>, id: String, data: String) -> Result<(), String> {
    manager.write(&id, data.as_bytes())
}

#[tauri::command]
pub fn pty_resize(manager: State<'_, PtyManager>, id: String, rows: u16, cols: u16) -> Result<(), String> {
    manager.resize(&id, rows, cols)
}

#[tauri::command]
pub fn pty_close(manager: State<'_, PtyManager>, id: String) -> Result<(), String> {
    manager.close(&id)
}
