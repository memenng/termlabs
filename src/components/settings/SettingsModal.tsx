import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconX, IconSettings, IconMoon, IconSun } from "@tabler/icons-react";
import { useSettingsStore, type AppSettings } from "../../stores/settingsStore";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [local, setLocal] = useState<AppSettings>(settings);

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open, fetchSettings]);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    updateSettings(next);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <IconSettings size={20} className="text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
              </div>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                <IconX size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Theme */}
              <div>
                <label className="block text-xs text-text-secondary mb-2">Theme</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => update({ theme: "dark" })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border ${
                      local.theme === "dark"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <IconMoon size={16} />
                    Dark
                  </button>
                  <button
                    onClick={() => update({ theme: "light" })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border ${
                      local.theme === "light"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <IconSun size={16} />
                    Light
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-xs text-text-secondary mb-2">
                  Font Size: {local.font_size}px
                </label>
                <input
                  type="range"
                  min={10}
                  max={24}
                  value={local.font_size}
                  onChange={(e) => update({ font_size: Number(e.target.value) })}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>10px</span>
                  <span>24px</span>
                </div>
              </div>

              {/* Cursor Style */}
              <div>
                <label className="block text-xs text-text-secondary mb-2">Cursor Style</label>
                <select
                  value={local.cursor_style}
                  onChange={(e) => update({ cursor_style: e.target.value })}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="bar">Bar</option>
                  <option value="block">Block</option>
                  <option value="underline">Underline</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={local.cursor_blink}
                    onChange={(e) => update({ cursor_blink: e.target.checked })}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="text-sm text-text-primary">Cursor Blink</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={local.bell_enabled}
                    onChange={(e) => update({ bell_enabled: e.target.checked })}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="text-sm text-text-primary">Terminal Bell</span>
                </label>
              </div>

              {/* Scroll Buffer */}
              <div>
                <label className="block text-xs text-text-secondary mb-2">Scroll Buffer (lines)</label>
                <input
                  type="number"
                  value={local.scroll_buffer}
                  onChange={(e) => update({ scroll_buffer: Number(e.target.value) })}
                  min={1000}
                  max={100000}
                  step={1000}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              {/* Default Shell */}
              <div>
                <label className="block text-xs text-text-secondary mb-2">Default Shell</label>
                <input
                  value={local.default_shell || ""}
                  onChange={(e) => update({ default_shell: e.target.value || null })}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  placeholder="System default"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
