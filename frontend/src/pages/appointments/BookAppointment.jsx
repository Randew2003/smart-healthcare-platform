import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "./../../layouts/MainLayout";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    patientId: "PATIENT123",
    doctorId: "",
    date: "",
    time: "",
    notes: "",
    patientEmail: "",
    patientPhone: ""
  });

  // 🔥 fetch doctors (from doctor service)
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost:4005/api/doctors");
        setDoctors(res.data.data || []);
      } catch (err) {
        console.log("Doctor fetch error:", err.message);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.doctorId || !form.date || !form.time || !form.patientEmail || !form.patientPhone) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post(
        "http://localhost:4001/api/appointments",
        form
      );

      alert("🎉 Appointment booked successfully!");

      console.log("Response:", res.data);

      setForm({
        patientId: "PATIENT123",
        doctorId: "",
        date: "",
        time: "",
        notes: "",
        patientEmail: "",
        patientPhone: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Book Your Appointment</h2>
          <p style={styles.sub}>Select a doctor, choose a date and time, and confirm your visit.</p>
        </div>

        {/* GRID */}
        <div style={styles.grid}>
          
          {/* DOCTOR SELECT */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Select Doctor</h3>

            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Select Date</h3>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* TIME */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Select Time</h3>

            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* EMAIL */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Your Email</h3>

            <input
              type="email"
              name="patientEmail"
              value={form.patientEmail}
              onChange={handleChange}
              placeholder="Enter your email"
              style={styles.input}
            />
          </div>

          {/* PHONE */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Your Phone</h3>

            <input
              type="tel"
              name="patientPhone"
              value={form.patientPhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              style={styles.input}
            />
          </div>

          {/* REASON */}
          <div style={{ ...styles.card, gridColumn: "span 2" }}>
            <h3 style={styles.cardTitle}>Reason for Visit</h3>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Describe your symptoms or reason..."
              style={styles.textarea}
            />
          </div>
        </div>

        {/* BUTTON */}
        <div style={styles.actions}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Booking..." : "Confirm Appointment"}
          </button>
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

  grid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20
  },

  card: {
    background: "#fff",
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)"
  },

  cardTitle: {
    marginBottom: "12px",
    color: "#111827",
    fontSize: 16
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
    background: "#fff"
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    background: "#fff",
    fontSize: 14
  },

  actions: {
    marginTop: "30px",
    textAlign: "center"
  },

  button: {
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    border: "none",
    padding: "12px 14px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 900,
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)"
  }
};