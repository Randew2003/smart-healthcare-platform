import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { api } from "../utils/api";
import { getUser, isLoggedIn } from "../utils/auth";

export default function Telemedicine() {
  const user = getUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);

  const [creating, setCreating] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const load = async () => {
    if (!isLoggedIn() || !user?.id) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/sessions/patient/${encodeURIComponent(user.id)}`);
      const list = Array.isArray(data) ? data : data?.data;
      setSessions(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load telemedicine sessions.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createSession = async (e) => {
    e.preventDefault();

    if (!isLoggedIn() || !user?.id) {
      setError("Please login first.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      await api.post("/api/sessions", {
        patientId: user.id,
        doctorId,
        appointmentId,
        scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null,
        status: "scheduled"
      });

      setAppointmentId("");
      setDoctorId("");
      setScheduledTime("");

      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create session.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Telemedicine</h2>
          <p style={styles.sub}>Create and manage online consultation sessions.</p>
        </div>

        {!isLoggedIn() ? (
          <div style={styles.note}>Login to view your sessions.</div>
        ) : null}

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Create session</h3>
            <p style={styles.help}>
              Use this when a telemedicine session is needed for an appointment.
            </p>

            <form onSubmit={createSession} style={styles.form}>
              <label style={styles.label}>Appointment ID</label>
              <input value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} style={styles.input} placeholder="Appointment _id" />

              <label style={styles.label}>Doctor ID</label>
              <input value={doctorId} onChange={(e) => setDoctorId(e.target.value)} style={styles.input} placeholder="Doctor _id" required />

              <label style={styles.label}>Scheduled time</label>
              <input value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} type="datetime-local" style={styles.input} />

              <button disabled={creating} style={styles.button} type="submit">
                {creating ? "Creating..." : "Create session"}
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>My sessions</h3>
            {loading ? <div style={styles.note}>Loading...</div> : null}

            <div style={styles.list}>
              {sessions.map((s) => (
                <div key={s._id} style={styles.row}>
                  <div style={styles.rowTitle}>
                    Session <span style={styles.mono}>{s._id}</span>
                    <span style={styles.status}>{s.status || "-"}</span>
                  </div>
                  <div style={styles.rowMeta}>
                    <b>Doctor:</b> <span style={styles.mono}>{s.doctorId || "-"}</span>
                  </div>
                  <div style={styles.rowMeta}>
                    <b>Appointment:</b> <span style={styles.mono}>{s.appointmentId || "-"}</span>
                  </div>
                  <div style={styles.rowMeta}>
                    <b>Scheduled:</b> {s.scheduledTime ? new Date(s.scheduledTime).toLocaleString() : "-"}
                  </div>

                  {s.meetingLink ? (
                    <a href={s.meetingLink} target="_blank" rel="noreferrer" style={styles.meeting}>
                      Open meeting link
                    </a>
                  ) : null}
                </div>
              ))}

              {!loading && sessions.length === 0 ? (
                <div style={styles.note}>No sessions yet.</div>
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
  grid: { marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 },
  card: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 18
  },
  cardTitle: { margin: 0, fontSize: 16, color: "#111827" },
  help: { margin: "8px 0 0 0", color: "#4b5563", fontSize: 12, lineHeight: 1.6 },
  form: { marginTop: 12, display: "grid", gap: 10 },
  label: { fontSize: 13, fontWeight: 700, color: "#374151" },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
    background: "#fff"
  },
  button: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13
  },
  list: { marginTop: 12, display: "grid", gap: 10 },
  row: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "#fbfdf9"
  },
  rowTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    fontWeight: 900,
    fontSize: 12,
    color: "#111827"
  },
  status: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(128,195,66,0.10)",
    border: "1px solid rgba(128,195,66,0.25)",
    color: "#2f6b14",
    fontWeight: 900
  },
  rowMeta: { marginTop: 8, color: "#4b5563", fontSize: 12, lineHeight: 1.6 },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  meeting: { marginTop: 10, display: "inline-block", color: "#2f6b14", fontWeight: 900, fontSize: 12, textDecoration: "none" },
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
