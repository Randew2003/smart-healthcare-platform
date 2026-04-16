import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usersCount, setUsersCount] = useState(0);
  const [pendingDoctorsCount, setPendingDoctorsCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [usersRes, pendingRes] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/admin/doctors/pending")
        ]);

        if (!mounted) return;

        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const pending = Array.isArray(pendingRes.data) ? pendingRes.data : [];

        setUsersCount(users.length);
        setPendingDoctorsCount(pending.length);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load admin dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Admin Dashboard</h2>
          <p style={styles.sub}>Manage users and verify doctors.</p>
        </div>

        {loading ? <div style={styles.note}>Loading...</div> : null}
        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardTop} />
            <div style={styles.metric}>{usersCount}</div>
            <div style={styles.metricLabel}>Total users</div>
            <Link to="/admin/users" style={styles.button}>Manage Users</Link>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop} />
            <div style={styles.metric}>{pendingDoctorsCount}</div>
            <div style={styles.metricLabel}>Pending doctor verifications</div>
            <Link to="/admin/doctors" style={styles.button}>Review Doctors</Link>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop} />
            <div style={styles.metric}>API</div>
            <div style={styles.metricLabel}>Admin endpoints</div>
            <div style={styles.smallText}>/api/admin/users, /api/admin/doctors/pending</div>
          </div>
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
  grid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 18,
    overflow: "hidden"
  },
  cardTop: {
    height: 6,
    borderRadius: 999,
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    width: 70,
    marginBottom: 12
  },
  metric: { fontSize: 28, fontWeight: 900, color: "#111827" },
  metricLabel: { marginTop: 6, color: "#4b5563", fontSize: 13, lineHeight: 1.7 },
  button: {
    display: "inline-block",
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 12,
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 13,
    textDecoration: "none"
  },
  smallText: { marginTop: 10, color: "#6b7280", fontSize: 12, lineHeight: 1.6 },
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
