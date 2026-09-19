import { useState, useEffect, useCallback } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  resetUserPassword,
  AdminUser,
  PaginatedUsers,
  CreateUserInput,
  UpdateUserInput,
} from "../api";

interface UserManagementProps {
  currentUserId: number;
}

const ROLE_LABELS: Record<string, string> = {
  REQUESTER: "Requester",
  IT_STAFF: "IT Staff",
  ADMINISTRATOR: "Administrator",
};

const ROLE_COLORS: Record<string, string> = {
  REQUESTER: "#4ade80",
  IT_STAFF: "#60a5fa",
  ADMINISTRATOR: "#f472b6",
};

export function UserManagement({ currentUserId }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ totalItems: 0, currentPage: 1, totalPages: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);

  // Success messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: PaginatedUsers = await fetchUsers({
        search: search || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        isActive: activeFilter !== "ALL" ? activeFilter : undefined,
        page,
        limit: 10,
      });
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, activeFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #065f46 0%, #047857 60%, #059669 100%)",
        borderRadius: "16px",
        padding: "28px 32px",
        marginBottom: "24px",
        color: "#fff",
      }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
          👥 User Management
        </h1>
        <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: "0.95rem" }}>
          Create, edit, and manage user accounts
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{
          padding: "12px 18px",
          background: "#d1fae5",
          border: "1px solid #6ee7b7",
          borderRadius: "10px",
          color: "#065f46",
          marginBottom: "16px",
          fontWeight: 500,
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 18px",
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "10px",
          color: "#991b1b",
          marginBottom: "16px",
          fontWeight: 500,
          fontSize: "0.9rem",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Controls Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "center",
        marginBottom: "20px",
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={handleSearchChange}
          style={{
            flex: "1 1 220px",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            fontSize: "0.9rem",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="ALL">All Roles</option>
          <option value="REQUESTER">Requester</option>
          <option value="IT_STAFF">IT Staff</option>
          <option value="ADMINISTRATOR">Administrator</option>
        </select>

        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            fontSize: "0.9rem",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="ALL">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #059669, #047857)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          ＋ Create User
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px", animation: "spin 1s linear infinite" }}>⏳</div>
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
          <p style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</p>
          <p>No users found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f0fdf4", borderBottom: "2px solid #d1fae5" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{
                    borderBottom: "1px solid #f3f4f6",
                    transition: "background 0.15s",
                    opacity: u.isActive ? 1 : 0.6,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{u.name}</div>
                      {u.mustChangePassword && (
                        <span style={{ fontSize: "0.72rem", color: "#d97706", background: "#fef3c7", padding: "1px 6px", borderRadius: "4px" }}>
                          Must change password
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#fff",
                        background: ROLE_COLORS[u.role] || "#9ca3af",
                      }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td style={tdStyle}>{u.department || "—"}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: u.isActive ? "#065f46" : "#991b1b",
                        background: u.isActive ? "#d1fae5" : "#fee2e2",
                      }}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => setEditingUser(u)} style={actionBtnStyle("#3b82f6")}>Edit</button>
                        <button onClick={() => setResetPasswordUser(u)} style={actionBtnStyle("#f59e0b")}>Reset PW</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 4px",
            fontSize: "0.88rem",
            color: "#6b7280",
          }}>
            <span>{pagination.totalItems} user(s) total</span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                style={pageBtnStyle(page <= 1)}
              >
                ← Previous
              </button>
              <span style={{ fontWeight: 600 }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                style={pageBtnStyle(page >= pagination.totalPages)}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(msg) => {
            setShowCreateModal(false);
            setSuccessMsg(msg);
            loadUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          currentUserId={currentUserId}
          onClose={() => setEditingUser(null)}
          onUpdated={(msg) => {
            setEditingUser(null);
            setSuccessMsg(msg);
            loadUsers();
          }}
        />
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onReset={(msg) => {
            setResetPasswordUser(null);
            setSuccessMsg(msg);
          }}
        />
      )}
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  fontWeight: 600,
  color: "#065f46",
  fontSize: "0.82rem",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  color: "#374151",
};

function actionBtnStyle(bg: string): React.CSSProperties {
  return {
    padding: "4px 12px",
    borderRadius: "6px",
    border: "none",
    background: bg,
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.76rem",
    cursor: "pointer",
    transition: "opacity 0.15s",
  };
}

function pageBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: disabled ? "#f9fafb" : "#fff",
    color: disabled ? "#d1d5db" : "#374151",
    fontWeight: 500,
    fontSize: "0.85rem",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

// ── Modal Overlay ──────────────────────────────────────────────────
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "28px 32px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "0.9rem",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  fontSize: "0.85rem",
  color: "#374151",
  marginBottom: "4px",
};

function primaryBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "none",
    background: disabled ? "#9ca3af" : "linear-gradient(135deg, #059669, #047857)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

// ── Create User Modal ──────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("REQUESTER");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: CreateUserInput = {
        name: name.trim(),
        email: email.trim(),
        role,
        department: department.trim() || undefined,
        initialPassword: password,
      };
      const newUser = await createUser(input);
      onCreated(`User "${newUser.name}" created successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ margin: "0 0 20px", fontSize: "1.25rem", fontWeight: 700, color: "#065f46" }}>
        ＋ Create New User
      </h2>
      {error && (
        <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b", marginBottom: "14px", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. John Doe" />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="e.g. john@example.com" />
          </div>
          <div>
            <label style={labelStyle}>Role *</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="REQUESTER">Requester</option>
              <option value="IT_STAFF">IT Staff</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <input style={inputStyle} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div>
            <label style={labelStyle}>Initial Password *</label>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 8 chars, upper+lower+digit/special" />
            <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
              User will be required to change this on first login.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={primaryBtnStyle(submitting)}>
              {submitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ── Edit User Modal ────────────────────────────────────────────────
function EditUserModal({ user, currentUserId, onClose, onUpdated }: {
  user: AdminUser;
  currentUserId: number;
  onClose: () => void;
  onUpdated: (msg: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [department, setDepartment] = useState(user.department || "");
  const [isActive, setIsActive] = useState(user.isActive);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = user.id === currentUserId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: UpdateUserInput = {};
      if (name.trim() !== user.name) input.name = name.trim();
      if (email.trim().toLowerCase() !== user.email) input.email = email.trim();
      if (role !== user.role) input.role = role;
      if ((department.trim() || null) !== user.department) input.department = department.trim() || null;
      if (isActive !== user.isActive) input.isActive = isActive;

      if (Object.keys(input).length === 0) {
        onClose();
        return;
      }

      await updateUser(user.id, input);
      onUpdated(`User "${name.trim()}" updated successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ margin: "0 0 20px", fontSize: "1.25rem", fontWeight: 700, color: "#065f46" }}>
        ✏️ Edit User
      </h2>
      {error && (
        <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b", marginBottom: "14px", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="REQUESTER">Requester</option>
              <option value="IT_STAFF">IT Staff</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <input style={inputStyle} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Active</label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: isSelf ? "not-allowed" : "pointer" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSelf}
                style={{ width: "18px", height: "18px", accentColor: "#059669" }}
              />
              <span style={{ fontSize: "0.85rem", color: isSelf ? "#9ca3af" : "#374151" }}>
                {isActive ? "Active" : "Inactive"}
                {isSelf && " (Cannot deactivate yourself)"}
              </span>
            </label>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={primaryBtnStyle(submitting)}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ── Reset Password Modal ───────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onReset }: {
  user: AdminUser;
  onClose: () => void;
  onReset: (msg: string) => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await resetUserPassword(user.id, newPassword);
      onReset(`Password for "${user.name}" has been reset. They must change it on next login.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ margin: "0 0 6px", fontSize: "1.25rem", fontWeight: 700, color: "#d97706" }}>
        🔑 Reset Password
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: "#6b7280" }}>
        Set a new temporary password for <strong>{user.name}</strong> ({user.email})
      </p>
      {error && (
        <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b", marginBottom: "14px", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>New Temporary Password *</label>
            <input
              style={inputStyle}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Min 8 chars, upper+lower+digit/special"
            />
            <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
              User will be required to change this on next login.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{
              ...primaryBtnStyle(submitting),
              background: submitting ? "#9ca3af" : "linear-gradient(135deg, #d97706, #b45309)",
            }}>
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}
