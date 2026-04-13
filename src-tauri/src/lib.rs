mod commands;
mod config;
mod pty;
mod ssh;

use commands::config::{config_get, config_update};
use commands::projects::{project_add, project_list, project_remove};
use commands::ssh::{
    ssh_add, ssh_duplicate, ssh_import_config, ssh_key_generate, ssh_key_list, ssh_list,
    ssh_remove, ssh_test, ssh_update,
};
use config::app::AppConfigManager;
use config::projects::ProjectManager;
use pty::handler::{pty_close, pty_resize, pty_spawn, pty_spawn_ssh, pty_write};
use pty::manager::PtyManager;
use ssh::connection::SshConnectionManager;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .manage(PtyManager::new())
        .manage(ProjectManager::new())
        .manage(SshConnectionManager::new())
        .manage(AppConfigManager::new())
        .setup(|app| {
            let config_dir = app.path().app_config_dir().expect("failed to get config dir");
            let project_manager = app.state::<ProjectManager>();
            project_manager.init(config_dir.clone());
            let ssh_manager = app.state::<SshConnectionManager>();
            ssh_manager.init(config_dir.clone());
            let app_config = app.state::<AppConfigManager>();
            app_config.init(config_dir);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            pty_spawn,
            pty_spawn_ssh,
            pty_write,
            pty_resize,
            pty_close,
            project_list,
            project_add,
            project_remove,
            ssh_list,
            ssh_add,
            ssh_update,
            ssh_remove,
            ssh_duplicate,
            ssh_test,
            ssh_import_config,
            ssh_key_list,
            ssh_key_generate,
            config_get,
            config_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
