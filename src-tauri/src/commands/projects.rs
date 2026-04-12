use crate::config::projects::{Project, ProjectManager};
use tauri::State;

#[tauri::command]
pub fn project_list(manager: State<'_, ProjectManager>) -> Vec<Project> {
    manager.list()
}

#[tauri::command]
pub fn project_add(manager: State<'_, ProjectManager>, name: String, path: String) -> Project {
    manager.add(name, path)
}

#[tauri::command]
pub fn project_remove(manager: State<'_, ProjectManager>, id: String) -> Result<(), String> {
    manager.remove(&id)
}
