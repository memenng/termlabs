use crate::ssh::config::{parse_ssh_config, SshHostConfig};
use crate::ssh::connection::{SshConnection, SshConnectionManager};
use crate::ssh::keys::{self, SshKey};
use tauri::State;

#[tauri::command]
pub fn ssh_list(manager: State<'_, SshConnectionManager>) -> Vec<SshConnection> {
    manager.list()
}

#[tauri::command]
pub fn ssh_add(manager: State<'_, SshConnectionManager>, conn: SshConnection) -> SshConnection {
    manager.add(conn)
}

#[tauri::command]
pub fn ssh_update(
    manager: State<'_, SshConnectionManager>,
    conn: SshConnection,
) -> Result<SshConnection, String> {
    manager.update(conn)
}

#[tauri::command]
pub fn ssh_remove(manager: State<'_, SshConnectionManager>, id: String) -> Result<(), String> {
    manager.remove(&id)
}

#[tauri::command]
pub fn ssh_duplicate(
    manager: State<'_, SshConnectionManager>,
    id: String,
) -> Result<SshConnection, String> {
    manager.duplicate(&id)
}

#[tauri::command]
pub fn ssh_test(conn: SshConnection) -> Result<bool, String> {
    SshConnectionManager::test_connection(&conn)
}

#[tauri::command]
pub fn ssh_import_config() -> Vec<SshHostConfig> {
    parse_ssh_config()
}

#[tauri::command]
pub fn ssh_key_list() -> Vec<SshKey> {
    keys::list_keys()
}

#[tauri::command]
pub fn ssh_key_generate(
    name: String,
    key_type: String,
    passphrase: String,
) -> Result<SshKey, String> {
    keys::generate_key(&name, &key_type, &passphrase)
}
