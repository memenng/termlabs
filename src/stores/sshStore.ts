import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface PortForward {
  local_port: number;
  remote_host: string;
  remote_port: number;
}

export interface SshConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_method:
    | { Password: { password: string } }
    | { Key: { key_path: string; passphrase: string | null } }
    | "Agent";
  port_forwards: PortForward[];
  group?: string;
}

export interface SshKey {
  name: string;
  path: string;
  key_type: string;
  public_key: string | null;
}

export interface SshHostConfig {
  host: string;
  hostname: string | null;
  user: string | null;
  port: number | null;
  identity_file: string | null;
}

type ConnectionStatus = "online" | "offline" | "checking";

interface SshState {
  connections: SshConnection[];
  keys: SshKey[];
  statuses: Record<string, ConnectionStatus>;
  loading: boolean;
  fetchConnections: () => Promise<void>;
  addConnection: (conn: SshConnection) => Promise<SshConnection>;
  updateConnection: (conn: SshConnection) => Promise<SshConnection>;
  removeConnection: (id: string) => Promise<void>;
  duplicateConnection: (id: string) => Promise<SshConnection>;
  testConnection: (conn: SshConnection) => Promise<boolean>;
  importFromConfig: () => Promise<SshHostConfig[]>;
  fetchKeys: () => Promise<void>;
  generateKey: (name: string, keyType: string, passphrase: string) => Promise<SshKey>;
}

export const useSshStore = create<SshState>((set) => ({
  connections: [],
  keys: [],
  statuses: {},
  loading: false,

  fetchConnections: async () => {
    set({ loading: true });
    const connections = await invoke<SshConnection[]>("ssh_list");
    set({ connections, loading: false });
  },

  addConnection: async (conn) => {
    const result = await invoke<SshConnection>("ssh_add", { conn });
    set((state) => ({ connections: [...state.connections, result] }));
    return result;
  },

  updateConnection: async (conn) => {
    const result = await invoke<SshConnection>("ssh_update", { conn });
    set((state) => ({
      connections: state.connections.map((c) => (c.id === result.id ? result : c)),
    }));
    return result;
  },

  removeConnection: async (id) => {
    await invoke("ssh_remove", { id });
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    }));
  },

  duplicateConnection: async (id) => {
    const result = await invoke<SshConnection>("ssh_duplicate", { id });
    set((state) => ({ connections: [...state.connections, result] }));
    return result;
  },

  testConnection: async (conn) => {
    set((state) => ({
      statuses: { ...state.statuses, [conn.id]: "checking" as ConnectionStatus },
    }));
    try {
      const result = await invoke<boolean>("ssh_test", { conn });
      set((state) => ({
        statuses: { ...state.statuses, [conn.id]: result ? "online" : "offline" },
      }));
      return result;
    } catch {
      set((state) => ({
        statuses: { ...state.statuses, [conn.id]: "offline" as ConnectionStatus },
      }));
      return false;
    }
  },

  importFromConfig: async () => {
    const configs = await invoke<SshHostConfig[]>("ssh_import_config");
    return configs;
  },

  fetchKeys: async () => {
    const keys = await invoke<SshKey[]>("ssh_key_list");
    set({ keys });
  },

  generateKey: async (name, keyType, passphrase) => {
    const key = await invoke<SshKey>("ssh_key_generate", {
      name,
      keyType,
      passphrase,
    });
    set((state) => ({ keys: [...state.keys, key] }));
    return key;
  },
}));
