import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";

export default function MyAppointments() {
  const user = getUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);

  const loadMyAppointments = async () => {
    if (!isLoggedIn()) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/appointments/patient/${user?.id || user?._id || "PATIENT123"}`);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyAppointments();
  }, []);

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>My Appointments</h2>
          <p style={styles.sub}>View and manage your scheduled appointments.</p>
        </div>

        {!isLoggedIn() ? (
          <div style={styles.note}>Please login to view your appointments.</div>
        ) : null}

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.headerRow}>
              <h3 style={styles.cardTitle}>My Appointments</h3>
              <Link to="/book-appointment" style={styles.primaryBtn}>
                Book New Appointment
              </Link>
            </div>

            {loading ? <div style={styles.note}>Loading...</div> : null}

            <div style={styles.list}>
              {appointments.map((appt) => (
                <div key={appt._id} style={styles.row}>
                  <div style={styles.rowTitle}>
                    {appt.status || "Scheduled"}
                    <span style={styles.mono}>{appt._id}</span>
                  </div>
                  <div style={styles.rowMeta}><b>Doctor:</b> Dr. {appt.doctor?.name || "N/A"} ({appt.doctor?.specialization || ""})</div>
                  <div style={styles.rowMeta}><b>Date:</b> {appt.date}</div>
                  <div style={styles.rowMeta}><b>Time:</b> {appt.time}</div>
                  <div style={styles.rowMeta}><b>Reason:</b> {appt.reason || "N/A"}</div>
                  <div style={styles.rowMeta}><b>Created:</b> {appt.createdAt ? new Date(appt.createdAt).toLocaleString() : "-"}</div>
                </div>
              ))}

              {!loading && appointments.length === 0 ? (
                <div style={styles.emptyState}>
                  <h4 style={styles.emptyTitle}>No Appointments Yet</h4>
                  <p style={styles.emptyText}>You haven't booked any appointments. Start by scheduling your first visit with a doctor.</p>
                </div>
              ) : null}
            </div>
          </div>
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
  grid: { marginTop: 18, display: "grid", gridTemplateColumns: "1fr", gap: 14 },
  card: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 18
  },
  cardTitle: { margin: 0, fontSize: 16, color: "#111827" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 },
  primaryBtn: {
    textDecoration: "none",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    fontSize: 13,
    display: "inline-block"
  },
  list: { marginTop: 12, display: "grid", gap: 10 },
  row: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "#fbfdf9"
  },
  rowTitle: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 12, color: "#111827" },
  rowMeta: { marginTop: 8, color: "#4b5563", fontSize: 12, lineHeight: 1.6 },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
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
  emptyState: { textAlign: "center", padding: "40px 20px" },
  emptyTitle: { margin: 0, fontSize: 18, color: "#111827", marginBottom: 8 },
  emptyText: { margin: 0, color: "#4b5563", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }
};