import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconX, IconBrandGithub, IconFileText, IconRefresh, IconDownload } from "@tabler/icons-react";
import { getVersion } from "@tauri-apps/api/app";
import { platform, arch } from "@tauri-apps/plugin-os";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "up-to-date" | "error";

export function AboutModal({ open, onClose }: AboutModalProps) {
  const [version, setVersion] = useState("0.0.0");
  const [osInfo, setOsInfo] = useState({ platform: "", arch: "" });
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");
  const [updateVersion, setUpdateVersion] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);

  useEffect(() => {
    if (open) {
      getVersion().then(setVersion).catch(() => {});
      try {
        setOsInfo({ platform: platform(), arch: arch() });
      } catch {
        // OS plugin may not be available in dev
      }
    }
  }, [open]);

  const handleCheckUpdates = async () => {
    setUpdateStatus("checking");
    setUpdateError("");
    try {
      const update = await check();
      if (update) {
        setUpdateVersion(update.version);
        setUpdateStatus("available");
      } else {
        setUpdateStatus("up-to-date");
      }
    } catch (e) {
      setUpdateError(String(e));
      setUpdateStatus("error");
    }
  };

  const handleDownloadAndInstall = async () => {
    setUpdateStatus("downloading");
    setDownloadProgress(0);
    setDownloadTotal(0);
    try {
      const update = await check();
      if (update) {
        let downloaded = 0;
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              setDownloadTotal(event.data.contentLength ?? 0);
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              setDownloadProgress(downloaded);
              break;
            case "Finished":
              setDownloadProgress(downloadTotal);
              break;
          }
        });
        await relaunch();
      }
    } catch (e) {
      setUpdateError(String(e));
      setUpdateStatus("error");
    }
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
            className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl text-center"
          >
            <div className="flex justify-end">
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                <IconX size={18} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src="/icons/app-icon.png" alt="TermLabs" className="w-20 h-20 rounded-xl" />
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
                href="https://github.com/memenng/termlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <IconBrandGithub size={16} />
                GitHub
              </a>
              <a
                href="https://github.com/memenng/termlabs/blob/main/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <IconFileText size={16} />
                Changelog
              </a>
            </div>

            {/* Update section */}
            <div className="mt-5">
              {updateStatus === "idle" && (
                <button
                  onClick={handleCheckUpdates}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary hover:border-accent transition-colors"
                >
                  <IconRefresh size={14} />
                  Check for Updates
                </button>
              )}

              {updateStatus === "checking" && (
                <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-secondary opacity-70">
                  <IconRefresh size={14} className="animate-spin" />
                  Checking...
                </button>
              )}

              {updateStatus === "up-to-date" && (
                <p className="text-sm text-success">You're on the latest version!</p>
              )}

              {updateStatus === "available" && (
                <div>
                  <p className="text-sm text-accent mb-2">Version {updateVersion} available!</p>
                  <button
                    onClick={handleDownloadAndInstall}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <IconDownload size={14} />
                    Download & Install
                  </button>
                </div>
              )}

              {updateStatus === "downloading" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                    <IconRefresh size={14} className="animate-spin" />
                    {downloadTotal > 0
                      ? `Downloading... ${Math.round((downloadProgress / downloadTotal) * 100)}%`
                      : "Downloading..."}
                  </div>
                  <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: downloadTotal > 0
                          ? `${(downloadProgress / downloadTotal) * 100}%`
                          : "100%",
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  {downloadTotal > 0 && (
                    <p className="text-[10px] text-text-tertiary">
                      {(downloadProgress / 1024 / 1024).toFixed(1)} / {(downloadTotal / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              )}

              {updateStatus === "error" && (
                <div>
                  <p className="text-sm text-danger mb-2">Update check failed</p>
                  <p className="text-xs text-text-secondary mb-2">{updateError}</p>
                  <button
                    onClick={handleCheckUpdates}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-primary border border-border rounded-lg text-xs text-text-primary hover:border-accent transition-colors"
                  >
                    <IconRefresh size={12} />
                    Retry
                  </button>
                </div>
              )}
            </div>

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
