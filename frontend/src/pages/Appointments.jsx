import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { api } from "../utils/api";
import { getUser, isLoggedIn } from "../utils/auth";
import { submitPayHereCheckout } from "../utils/payhereCheckout";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Appointments() {
  const navigate = useNavigate();
  const query = useQuery();
  const preselectDoctorId = query.get("doctorId") || "";

  const user = getUser();
  const role = user?.role;
  const isPatient = role === "patient";
  const isDoctor = role === "doctor";

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(preselectDoctorId);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [amount, setAmount] = useState(1500);

  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const canBook = isPatient && !!doctorId && !!date && !!time && isLoggedIn();

  const loadDoctors = async () => {
    if (!isPatient) {
      setDoctors([]);
      setLoadingDoctors(false);
      return;
    }

    setLoadingDoctors(true);

    try {
      const { data } = await api.get("/api/auth/doctors");
      const list = Array.isArray(data) ? data : data?.data;
      const approved = Array.isArray(list) ? list : [];
      setDoctors(approved);
    } catch (_err) {
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadMyAppointments = async () => {
    if (!isLoggedIn() || !user?.id) return;

    setLoadingAppointments(true);
    try {
      const path = isDoctor
        ? `/appointments/doctor/${encodeURIComponent(user.id)}`
        : `/appointments/patient/${encodeURIComponent(user.id)}`;
      const { data } = await api.get(path);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (_err) {
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    loadMyAppointments();
  }, []);

  const createAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isPatient) {
      setError("Only patients can book appointments.");
      return;
    }

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    if (!user?.id) {
      setError("Missing user id. Please login again.");
      return;
    }

    setBooking(true);
    try {
      const { data } = await api.post("/appointments", {
        patientId: user.id,
        doctorId,
        date,
        time
      });

      const created = data?.appointment;
      setMessage(data?.message || "Appointment created.");

      await loadMyAppointments();

      // Optional: immediately start payment
      if (created?._id) {
        // keep the UI simple: stay on page; user can click Pay button in the list.
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create appointment.");
    } finally {
      setBooking(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!id) return;
    if (!isPatient) return;

    try {
      await api.delete(`/appointments/${encodeURIComponent(id)}`);
      await loadMyAppointments();
    } catch (_err) {
      // ignore
    }
  };

  const payForAppointment = async (appointment) => {
    setError("");
    setMessage("");

    if (!isPatient) {
      setError("Only patients can make payments.");
      return;
    }

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    try {
      const { data } = await api.post("/api/payments", {
        appointmentId: appointment?._id,
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        amount
      });

      submitPayHereCheckout(data?.payhere);
    } catch (err) {
      setError(err?.response?.data?.message || "Payment creation failed.");
    }
  };

  const doctorNameById = useMemo(() => {
    const map = new Map();
    doctors.forEach((d) => map.set(d._id, d.name || d.fullName));
    return (id) => map.get(id) || id;
  }, [doctors]);

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Appointments</h2>
          <p style={styles.sub}>Book appointments and manage your schedule.</p>
          {!isLoggedIn() ? (
            <p style={styles.small}>
              Please <Link to="/login" style={styles.link}>login</Link> to book and pay.
            </p>
          ) : null}
        </div>

        <div style={{
          ...styles.grid,
          gridTemplateColumns: isPatient ? "1.05fr 1.15fr" : "1fr"
        }}>
          {isPatient ? (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Book an appointment</h3>

            {error ? <div style={styles.error}>{error}</div> : null}
            {message ? <div style={styles.success}>{message}</div> : null}

            <form onSubmit={createAppointment} style={styles.form}>
              <label style={styles.label}>Doctor</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                style={styles.input}
                disabled={loadingDoctors}
              >
                <option value="">{loadingDoctors ? "Loading..." : "Select a doctor"}</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {(d.name || d.fullName || "Doctor")} — {(d.specialization || "General")}
                  </option>
                ))}
              </select>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Date</label>
                  <input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Time</label>
                  <input value={time} onChange={(e) => setTime(e.target.value)} type="time" style={styles.input} />
                </div>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Amount (LKR)</label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value || 0))}
                    type="number"
                    min={1}
                    style={styles.input}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "end" }}>
                  <button disabled={booking || !canBook} style={styles.button} type="submit">
                    {booking ? "Booking..." : "Book Appointment"}
                  </button>
                </div>
              </div>

              <div style={styles.hint}>
                Tip: Doctors list is available on <Link to="/doctors" style={styles.link}>Doctors</Link> page.
              </div>
            </form>
          </div>
          ) : null}

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>{isDoctor ? "My schedule" : "My appointments"}</h3>
            {loadingAppointments ? <div style={styles.note}>Loading...</div> : null}

            <div style={styles.list}>
              {appointments.map((a) => (
                <div key={a._id} style={styles.row}>
                  <div style={styles.rowTop}>
                    <div style={styles.rowTitle}>
                      {isDoctor ? `Patient: ${a.patientId || "-"}` : doctorNameById(a.doctorId)}
                      <span style={styles.status}>{a.status}</span>
                    </div>
                    <div style={styles.rowMeta}>
                      {a.date ? new Date(a.date).toLocaleDateString() : "-"} • {a.time || "-"}
                    </div>
                  </div>

                  {a.meetingLink ? (
                    <a href={a.meetingLink} target="_blank" rel="noreferrer" style={styles.meeting}>
                      Join live session
                    </a>
                  ) : null}

                  {isPatient ? (
                    <div style={styles.rowActions}>
                      <button onClick={() => payForAppointment(a)} style={styles.payBtn}>
                        Pay with PayHere
                      </button>
                      <button onClick={() => cancelAppointment(a._id)} style={styles.cancelBtn}>
                        Cancel
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}

              {!loadingAppointments && appointments.length === 0 ? (
                <div style={styles.note}>No appointments yet.</div>
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
  small: { margin: "10px 0 0 0", color: "#4b5563", fontSize: 13 },
  link: { color: "#60a421", fontWeight: 800, textDecoration: "none" },
  grid: { marginTop: 18, display: "grid", gridTemplateColumns: "1.05fr 1.15fr", gap: 14 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  card: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 18
  },
  cardTitle: { margin: 0, fontSize: 16, color: "#111827" },
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
  hint: { marginTop: 6, color: "#4b5563", fontSize: 12, lineHeight: 1.6 },
  button: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13
  },
  error: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.08)",
    color: "#b91c1c",
    border: "1px solid rgba(239,68,68,0.18)",
    fontSize: 13
  },
  success: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(34,197,94,0.10)",
    color: "#166534",
    border: "1px solid rgba(34,197,94,0.20)",
    fontSize: 13
  },
  list: { marginTop: 12, display: "grid", gap: 10 },
  row: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "#fbfdf9"
  },
  rowTop: { display: "grid", gap: 6 },
  rowTitle: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontWeight: 900, color: "#111827", fontSize: 13 },
  status: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(251,176,51,0.14)",
    border: "1px solid rgba(251,176,51,0.30)",
    color: "#7a4d00",
    fontWeight: 900
  },
  rowMeta: { color: "#4b5563", fontSize: 12 },
  meeting: { marginTop: 8, display: "inline-block", color: "#2f6b14", fontWeight: 800, fontSize: 12, textDecoration: "none" },
  rowActions: { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" },
  payBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12
  },
  cancelBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(239,68,68,0.08)",
    color: "#b91c1c",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12
  },
  note: { color: "#4b5563", fontSize: 13 }
};
