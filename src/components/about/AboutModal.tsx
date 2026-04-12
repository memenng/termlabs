import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconX, IconBrandGithub, IconFileText, IconRefresh } from "@tabler/icons-react";
import { getVersion } from "@tauri-apps/api/app";
import { platform, arch } from "@tauri-apps/plugin-os";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  const [version, setVersion] = useState("0.0.0");
  const [osInfo, setOsInfo] = useState({ platform: "", arch: "" });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (open) {
      getVersion().then(setVersion).catch(() => {});
      try {
        const p = platform();
        const a = arch();
        setOsInfo({ platform: p, arch: a });
      } catch {
        // OS plugin may not be available in dev
      }
    }
  }, [open]);

  const handleCheckUpdates = () => {
    setChecking(true);
    // Simulated check — in production this would call an update API
    setTimeout(() => setChecking(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl text-center"
          >
            <div className="flex justify-end">
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                <IconX size={18} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <span className="text-5xl text-accent font-bold select-none">&#9670;</span>
            </div>

            {/* App name and version */}
            <h2 className="text-xl font-bold text-text-primary">TermLabs</h2>
            <p className="text-sm text-text-secondary mt-1">Version {version}</p>

            {/* Build info */}
            {osInfo.platform && (
              <p className="text-xs text-text-secondary mt-2">
                {osInfo.platform} / {osInfo.arch}
              </p>
            )}

            {/* Links */}
            <div className="flex justify-center gap-4 mt-5">
              <a
                href="https://github.com/termlabs/termlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <IconBrandGithub size={16} />
                GitHub
              </a>
              <a
                href="https://github.com/termlabs/termlabs/blob/main/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <IconFileText size={16} />
                Changelog
              </a>
            </div>

            {/* Check for updates */}
            <button
              onClick={handleCheckUpdates}
              disabled={checking}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary hover:border-accent transition-colors disabled:opacity-50"
            >
              <IconRefresh size={14} className={checking ? "animate-spin" : ""} />
              {checking ? "Checking..." : "Check for Updates"}
            </button>

            {/* Credits */}
            <p className="text-xs text-text-secondary mt-5">
              Built with Tauri, React, and xterm.js
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
