import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconX, IconServer } from "@tabler/icons-react";
import { useSshStore, type SshConnection } from "../../stores/sshStore";

interface SSHFormProps {
  open: boolean;
  onClose: () => void;
  editConnection?: SshConnection | null;
}

type AuthType = "Key" | "Password" | "Agent";

function getAuthType(conn: SshConnection): AuthType {
  if (conn.auth_method === "Agent") return "Agent";
  if ("Password" in conn.auth_method) return "Password";
  return "Key";
}

function getPassword(conn: SshConnection): string {
  if (conn.auth_method !== "Agent" && "Password" in conn.auth_method) {
    return conn.auth_method.Password.password;
  }
  return "";
}

function getKeyPath(conn: SshConnection): string {
  if (conn.auth_method !== "Agent" && "Key" in conn.auth_method) {
    return conn.auth_method.Key.key_path;
  }
  return "";
}

export function SSHForm({ open, onClose, editConnection }: SSHFormProps) {
  const { addConnection, updateConnection } = useSshStore();

  const [label, setLabel] = useState("");
  const [group, setGroup] = useState("");
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState("");
  const [authType, setAuthType] = useState<AuthType>("Key");
  const [password, setPassword] = useState("");
  const [keyPath, setKeyPath] = useState("~/.ssh/id_ed25519");

  useEffect(() => {
    if (editConnection) {
      setLabel(editConnection.name);
      setGroup(editConnection.group || "");
      setHostname(editConnection.host);
      setPort(editConnection.port);
      setUsername(editConnection.username);
      setAuthType(getAuthType(editConnection));
      setPassword(getPassword(editConnection));
      setKeyPath(getKeyPath(editConnection));
    } else {
      setLabel("");
      setGroup("");
      setHostname("");
      setPort(22);
      setUsername("");
      setAuthType("Key");
      setPassword("");
      setKeyPath("~/.ssh/id_ed25519");
    }
  }, [editConnection, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let auth_method: SshConnection["auth_method"];
    if (authType === "Password") {
      auth_method = { Password: { password } };
    } else if (authType === "Key") {
      auth_method = { Key: { key_path: keyPath, passphrase: null } };
    } else {
      auth_method = "Agent";
    }

    const conn: SshConnection = {
      id: editConnection?.id || "",
      name: label,
      host: hostname,
      port,
      username,
      auth_method,
      port_forwards: editConnection?.port_forwards || [],
      group: group || undefined,
    };

    if (editConnection) {
      await updateConnection(conn);
    } else {
      await addConnection(conn);
    }
    onClose();
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
                <IconServer size={20} className="text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">
                  {editConnection ? "Edit Connection" : "New SSH Connection"}
                </h2>
              </div>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Label</label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    required
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    placeholder="My Server"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Group</label>
                  <input
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    placeholder="Production"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">Hostname</label>
                  <input
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    required
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    placeholder="192.168.1.1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  placeholder="root"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Auth Method</label>
                <div className="flex gap-1 bg-bg-primary border border-border rounded-lg p-1">
                  {(["Key", "Password", "Agent"] as AuthType[]).map((type_) => (
                    <button
                      key={type_}
                      type="button"
                      onClick={() => setAuthType(type_)}
                      className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
                        authType === type_
                          ? "bg-accent text-white"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {type_}
                    </button>
                  ))}
                </div>
              </div>

              {authType === "Password" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <label className="block text-xs text-text-secondary mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                </motion.div>
              )}

              {authType === "Key" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <label className="block text-xs text-text-secondary mb-1">Key Path</label>
                  <input
                    value={keyPath}
                    onChange={(e) => setKeyPath(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    placeholder="~/.ssh/id_ed25519"
                  />
                </motion.div>
              )}

              <button
                type="submit"
                className="mt-2 w-full py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {editConnection ? "Save Changes" : "Add Connection"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
