use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    pub font_size: u16,
    pub font_family_ui: String,
    pub font_family_terminal: String,
    pub default_shell: Option<String>,
    pub cursor_style: String,
    pub cursor_blink: bool,
    pub scroll_buffer: u32,
    pub bell_enabled: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            font_size: 14,
            font_family_ui: "Satoshi".to_string(),
            font_family_terminal: "JetBrains Mono".to_string(),
            default_shell: None,
            cursor_style: "bar".to_string(),
            cursor_blink: true,
            scroll_buffer: 10000,
            bell_enabled: false,
        }
    }
}

pub struct AppConfigManager {
    settings: Mutex<AppSettings>,
    config_path: Mutex<Option<PathBuf>>,
}

impl AppConfigManager {
    pub fn new() -> Self {
        Self {
            settings: Mutex::new(AppSettings::default()),
            config_path: Mutex::new(None),
        }
    }

    pub fn init(&self, config_dir: PathBuf) {
        let path = config_dir.join("settings.json");
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(settings) = serde_json::from_str::<AppSettings>(&data) {
                *self.settings.lock() = settings;
            }
        }
        *self.config_path.lock() = Some(path);
    }

    fn save(&self) {
        if let Some(path) = self.config_path.lock().as_ref() {
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let data = serde_json::to_string_pretty(&*self.settings.lock()).unwrap_or_default();
            let _ = fs::write(path, data);
        }
    }

    pub fn get(&self) -> AppSettings {
        self.settings.lock().clone()
    }

    pub fn update(&self, settings: AppSettings) {
        *self.settings.lock() = settings;
        self.save();
    }
}
