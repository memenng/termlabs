mod commands;
mod config;
mod pty;

use commands::projects::{project_add, project_list, project_remove};
use config::projects::ProjectManager;
use pty::handler::{pty_close, pty_resize, pty_spawn, pty_write};
use pty::manager::PtyManager;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(PtyManager::new())
        .manage(ProjectManager::new())
        .setup(|app| {
            let config_dir = app.path().app_config_dir().expect("failed to get config dir");
            let manager = app.state::<ProjectManager>();
            manager.init(config_dir);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            pty_spawn,
            pty_write,
            pty_resize,
            pty_close,
            project_list,
            project_add,
            project_remove,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
