import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";

export default function AdminAppointments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [doctorId, setDoctorId] = useState("");

  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const userById = useMemo(() => {
    const map = new Map();
    (Array.isArray(users) ? users : []).forEach((u) => {
      if (u?._id) map.set(String(u._id), u);
    });
    return map;
  }, [users]);

  const doctors = useMemo(() => {
    return (Array.isArray(users) ? users : [])
      .filter((u) => u?.role === "doctor")
      .sort((a, b) => String(a?.fullName || "").localeCompare(String(b?.fullName || "")));
  }, [users]);

  async function loadUsers() {
    const res = await api.get("/api/admin/users");
    return Array.isArray(res.data) ? res.data : [];
  }

  async function loadAppointments(selectedDoctorId) {
    setAppointmentsLoading(true);
    setError("");

    try {
      const qs = selectedDoctorId ? `?doctorId=${encodeURIComponent(selectedDoctorId)}` : "";
      const res = await api.get(`/appointments${qs}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAppointments([]);
      setError(err?.response?.data?.message || "Failed to load appointments.");
    } finally {
      setAppointmentsLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      setError("");

      try {
        const allUsers = await loadUsers();
        if (!mounted) return;
        setUsers(allUsers);

        // initial load: all appointments
        await loadAppointments("");
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load admin data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // reload appointments when filter changes
    if (!loading) {
      loadAppointments(doctorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const rows = useMemo(() => {
    return [...(Array.isArray(appointments) ? appointments : [])].sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
    );
  }, [appointments]);

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Appointments</h2>
          <p style={styles.sub}>View all appointments and filter by doctor.</p>
        </div>

        {loading ? <div style={styles.note}>Loading...</div> : null}
        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.toolbar}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              style={styles.select}
              disabled={loading}
            >
              <option value="">All doctors</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName || d.email || d._id}
                  {d.doctorVerificationStatus ? ` (${d.doctorVerificationStatus})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.stats}>
            <div style={styles.statChip}>Total: {rows.length}</div>
            {appointmentsLoading ? <div style={styles.statChip}>Refreshing…</div> : null}
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Doctor</th>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Status</th>
                <th style={styles.thRight}>Session</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} style={styles.empty}>No appointments found.</td>
                </tr>
              ) : null}

              {rows.map((a) => {
                const doctor = userById.get(String(a?.doctorId || ""));
                const patient = userById.get(String(a?.patientId || ""));

                return (
                  <tr key={a._id}>
                    <td style={styles.td}>{doctor?.fullName || doctor?.email || a?.doctorId || "—"}</td>
                    <td style={styles.td}>{patient?.fullName || patient?.email || a?.patientId || "—"}</td>
                    <td style={styles.td}>
                      {a?.date ? new Date(a.date).toLocaleDateString() : "—"}
                    </td>
                    <td style={styles.td}>{a?.time || "—"}</td>
                    <td style={styles.td}>
                      <span style={styles.statusPill}>{a?.status || "—"}</span>
                    </td>
                    <td style={styles.tdRight}>
                      {a?.meetingLink ? (
                        <a
                          href={a.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.sessionLink}
                        >
                          Join
                        </a>
                      ) : (
                        "—"
                      )}
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
    maxWidth: 1200,
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

  toolbar: {
    marginTop: 14,
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap"
  },
  filterGroup: { display: "grid", gap: 6, minWidth: 280 },
  label: { fontSize: 13, fontWeight: 800, color: "#374151" },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
    background: "#fff"
  },
  stats: { display: "flex", gap: 10, flexWrap: "wrap" },
  statChip: {
    padding: "10px 12px",
    borderRadius: 999,
    background: "rgba(128,195,66,0.10)",
    border: "1px solid rgba(128,195,66,0.22)",
    color: "#2f6b14",
    fontWeight: 900,
    fontSize: 12
  },

  tableWrap: {
    marginTop: 14,
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    overflow: "hidden"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    letterSpacing: 0.3,
    padding: "12px 14px",
    borderBottom: "1px solid rgba(0,0,0,0.06)"
  },
  thRight: {
    textAlign: "right",
    fontSize: 12,
    color: "#6b7280",
    letterSpacing: 0.3,
    padding: "12px 14px",
    borderBottom: "1px solid rgba(0,0,0,0.06)"
  },
  td: {
    padding: "12px 14px",
    fontSize: 13,
    color: "#111827",
    borderBottom: "1px solid rgba(0,0,0,0.04)",
    verticalAlign: "top"
  },
  tdRight: {
    padding: "12px 14px",
    fontSize: 13,
    color: "#111827",
    borderBottom: "1px solid rgba(0,0,0,0.04)",
    verticalAlign: "top",
    textAlign: "right"
  },
  statusPill: {
    display: "inline-block",
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(251,176,51,0.14)",
    border: "1px solid rgba(251,176,51,0.30)",
    color: "#7a4d00",
    fontWeight: 900
  },
  sessionLink: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 12,
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 12,
    textDecoration: "none"
  },
  empty: {
    padding: 18,
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center"
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
  note: { marginTop: 14, color: "#4b5563", fontSize: 13 }
};
