import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { api } from "../utils/api";

export default function Doctors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/api/auth/doctors");
        const list = Array.isArray(data) ? data : data?.data;
        const approved = Array.isArray(list) ? list : [];
        if (mounted) setDoctors(approved);
      } catch (_err) {
        if (mounted) {
          setDoctors([]);
          setError("Failed to load doctors.");
        }
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
          <h2 style={styles.title}>Doctors</h2>
          <p style={styles.sub}>Browse doctors and book your appointment.</p>
        </div>

        {loading ? <div style={styles.note}>Loading doctors...</div> : null}
        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.grid}>
          {doctors.map((d) => (
            <div key={d._id} style={styles.card}>
              <div style={styles.badge}>{d.specialization || "Specialist"}</div>
              <h3 style={styles.name}>{d.name || "Doctor"}</h3>
              <div style={styles.meta}>
                <div><b>Email:</b> {d.email || "-"}</div>
                <div><b>Hospital:</b> {d.hospital || "-"}</div>
                <div><b>Experience:</b> {typeof d.experience === "number" ? `${d.experience} yrs` : "-"}</div>
                <div><b>Status:</b> {d.verificationStatus || (d.isVerified ? "verified" : "pending")}</div>
              </div>

              <div style={styles.actions}>
                <Link to={`/appointments?doctorId=${encodeURIComponent(d._id)}`} style={styles.button}>
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && doctors.length === 0 ? (
          <div style={styles.note}>No doctors found yet.</div>
        ) : null}
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
  title: {
    margin: 0,
    fontSize: 28,
    color: "#1f2937"
  },
  sub: {
    margin: "10px 0 0 0",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.8
  },
  grid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 18
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(128,195,66,0.10)",
    border: "1px solid rgba(128,195,66,0.25)",
    color: "#2f6b14",
    fontSize: 12,
    fontWeight: 800
  },
  name: {
    margin: "12px 0 0 0",
    fontSize: 18,
    color: "#111827"
  },
  meta: {
    marginTop: 10,
    display: "grid",
    gap: 6,
    color: "#374151",
    fontSize: 13,
    lineHeight: 1.6
  },
  actions: {
    marginTop: 14
  },
  button: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 12,
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 13,
    textDecoration: "none"
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
  note: {
    marginTop: 14,
    color: "#4b5563",
    fontSize: 13
  }
};
