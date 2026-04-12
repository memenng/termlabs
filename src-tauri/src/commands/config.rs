use crate::config::app::{AppConfigManager, AppSettings};
use tauri::State;

#[tauri::command]
pub fn config_get(manager: State<'_, AppConfigManager>) -> AppSettings {
    manager.get()
}

#[tauri::command]
pub fn config_update(manager: State<'_, AppConfigManager>, settings: AppSettings) {
    manager.update(settings);
}
