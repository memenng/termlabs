import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface AppSettings {
  theme: string;
  font_size: number;
  font_family_ui: string;
  font_family_terminal: string;
  default_shell: string | null;
  cursor_style: string;
  cursor_blink: boolean;
  scroll_buffer: number;
  bell_enabled: boolean;
}

const defaultSettings: AppSettings = {
  theme: "dark",
  font_size: 14,
  font_family_ui: "Satoshi",
  font_family_terminal: "JetBrains Mono",
  default_shell: null,
  cursor_style: "bar",
  cursor_blink: true,
  scroll_buffer: 10000,
  bell_enabled: false,
};

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const settings = await invoke<AppSettings>("config_get");
      set({ settings, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateSettings: async (settings) => {
    await invoke("config_update", { settings });
    set({ settings });
  },
}));
