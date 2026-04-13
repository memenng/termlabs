import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconX, IconKey, IconPlus } from "@tabler/icons-react";
import { useSshStore } from "../../stores/sshStore";

interface KeyManagerProps {
  open: boolean;
  onClose: () => void;
}

export function KeyManager({ open, onClose }: KeyManagerProps) {
  const { keys, fetchKeys, generateKey } = useSshStore();
  const [showGenerate, setShowGenerate] = useState(false);
  const [name, setName] = useState("");
  const [keyType, setKeyType] = useState("ed25519");
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchKeys();
    }
  }, [open, fetchKeys]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGenerating(true);
    try {
      await generateKey(name, keyType, passphrase);
      setShowGenerate(false);
      setName("");
      setPassphrase("");
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
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
            className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <IconKey size={20} className="text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">SSH Keys</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGenerate((prev) => !prev)}
                  className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-bg-tertiary/50"
                  title="Generate new key"
                >
                  <IconPlus size={16} />
                </button>
                <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                  <IconX size={18} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showGenerate && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleGenerate}
                  className="overflow-hidden mb-4 border border-border rounded-lg p-4 bg-bg-primary"
                >
                  <h3 className="text-sm font-medium text-text-primary mb-3">Generate New Key</h3>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                        placeholder="id_my_key"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Key Type</label>
                      <div className="flex gap-1 bg-bg-secondary border border-border rounded-lg p-1">
                        {["ed25519", "rsa"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setKeyType(t)}
                            className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
                              keyType === t
                                ? "bg-accent text-white"
                                : "text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Passphrase (optional)</label>
                      <input
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                        placeholder="Leave empty for no passphrase"
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-400">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={generating}
                      className="w-full py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {generating ? "Generating..." : "Generate Key"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto space-y-2">
              {keys.length === 0 ? (
                <p className="text-sm text-text-secondary italic text-center py-4">
                  No SSH keys found in ~/.ssh/
                </p>
              ) : (
                keys.map((key) => (
                  <div
                    key={key.path}
                    className="flex items-start gap-3 p-3 bg-bg-primary border border-border rounded-lg"
                  >
                    <IconKey size={16} className="text-accent mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">{key.name}</span>
                        <span className="text-xs text-text-secondary bg-bg-tertiary px-1.5 py-0.5 rounded">
                          {key.key_type}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate mt-0.5">{key.path}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
