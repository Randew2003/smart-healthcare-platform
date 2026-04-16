import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/admin/users");
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const ar = String(a?.role || "");
      const br = String(b?.role || "");
      if (ar !== br) return ar.localeCompare(br);
      const ae = String(a?.email || "");
      const be = String(b?.email || "");
      return ae.localeCompare(be);
    });
  }, [users]);

  async function toggleStatus(user) {
    const id = user?._id;
    if (!id) return;

    setBusyId(id);
    setError("");

    try {
      await api.patch(`/api/admin/users/${id}/toggle-status`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to toggle user status.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteUser(user) {
    const id = user?._id;
    if (!id) return;

    const email = user?.email ? ` (${user.email})` : "";
    const ok = window.confirm(`Delete user${email}? This cannot be undone.`);
    if (!ok) return;

    setBusyId(id);
    setError("");

    try {
      await api.delete(`/api/admin/users/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Users</h2>
          <p style={styles.sub}>Toggle account status or remove users.</p>
        </div>

        {loading ? <div style={styles.note}>Loading...</div> : null}
        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.thRight}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} style={styles.empty}>No users found.</td>
                </tr>
              ) : null}

              {sortedUsers.map((u) => {
                const id = u?._id;
                const isBusy = busyId === id;

                const active = u?.isActive;
                const statusText = active === false ? "Disabled" : "Active";

                return (
                  <tr key={id}>
                    <td style={styles.td}>{u?.email || "—"}</td>
                    <td style={styles.td}>{u?.role || "—"}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(active === false ? styles.badgeOff : styles.badgeOn)
                        }}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td style={styles.tdRight}>
                      <button
                        type="button"
                        onClick={() => toggleStatus(u)}
                        disabled={isBusy}
                        style={styles.actionBtn}
                      >
                        {isBusy ? "Working..." : "Toggle"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(u)}
                        disabled={isBusy}
                        style={{ ...styles.actionBtn, ...styles.dangerBtn }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  page: {
    padding: "26px 16px 60px 16px",
    maxWidth: 1100,
    margin: "0 auto"
  },
  hero: {
    background: "linear-gradient(135deg, rgba(128,195,66,0.16), rgba(251,176,51,0.14))",
    border: "1px solid rgba(128,195,66,0.15)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 12px 40px rgba(0,0,0,0.06)"
  },
  title: { margin: 0, fontSize: 28, color: "#1f2937" },
  sub: { margin: "10px 0 0 0", color: "#4b5563", fontSize: 14, lineHeight: 1.8 },
  tableWrap: {
    marginTop: 16,
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    overflow: "hidden"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    background: "rgba(17,24,39,0.03)",
    color: "#374151",
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase"
  },
  thRight: {
    textAlign: "right",
    padding: "12px 14px",
    background: "rgba(17,24,39,0.03)",
    color: "#374151",
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase"
  },
  td: {
    padding: "12px 14px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    color: "#111827",
    fontSize: 13
  },
  tdRight: {
    padding: "12px 14px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    color: "#111827",
    fontSize: 13,
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid transparent"
  },
  badgeOn: {
    background: "rgba(34,197,94,0.10)",
    color: "#166534",
    borderColor: "rgba(34,197,94,0.20)"
  },
  badgeOff: {
    background: "rgba(239,68,68,0.10)",
    color: "#991b1b",
    borderColor: "rgba(239,68,68,0.20)"
  },
  actionBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    marginLeft: 8
  },
  dangerBtn: {
    background: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.22)",
    color: "#b91c1c"
  },
  error: {
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.08)",
    color: "#b91c1c",
    border: "1px solid rgba(239,68,68,0.18)",
    fontSize: 13
  },
  note: { marginTop: 14, color: "#4b5563", fontSize: 13 },
  empty: { padding: 18, textAlign: "center", color: "#6b7280", fontSize: 13 }
};
