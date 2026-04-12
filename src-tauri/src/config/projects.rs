use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
}

pub struct ProjectManager {
    projects: Mutex<Vec<Project>>,
    config_path: Mutex<Option<PathBuf>>,
}

impl ProjectManager {
    pub fn new() -> Self {
        Self {
            projects: Mutex::new(Vec::new()),
            config_path: Mutex::new(None),
        }
    }

    pub fn init(&self, config_dir: PathBuf) {
        let path = config_dir.join("projects.json");
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(projects) = serde_json::from_str::<Vec<Project>>(&data) {
                *self.projects.lock() = projects;
            }
        }
        *self.config_path.lock() = Some(path);
    }

    fn save(&self) {
        if let Some(path) = self.config_path.lock().as_ref() {
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let data = serde_json::to_string_pretty(&*self.projects.lock()).unwrap_or_default();
            let _ = fs::write(path, data);
        }
    }

    pub fn list(&self) -> Vec<Project> {
        self.projects.lock().clone()
    }

    pub fn add(&self, name: String, path: String) -> Project {
        let project = Project {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            path,
        };
        self.projects.lock().push(project.clone());
        self.save();
        project
    }

    pub fn remove(&self, id: &str) -> Result<(), String> {
        let mut projects = self.projects.lock();
        let idx = projects
            .iter()
            .position(|p| p.id == id)
            .ok_or("Project not found")?;
        projects.remove(idx);
        drop(projects);
        self.save();
        Ok(())
    }
}
