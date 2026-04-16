import { useState } from "react";
import MainLayout from "../layouts/MainLayout";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // No backend endpoint yet; keep UI consistent.
    setSent(true);
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Contact</h2>
          <p style={styles.sub}>We’re here to help you 24/7.</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Send a message</h3>
            {sent ? (
              <div style={styles.success}>Message submitted (demo). We’ll contact you soon.</div>
            ) : null}
            <form onSubmit={onSubmit} style={styles.form}>
              <label style={styles.label}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />

              <label style={styles.label}>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} type="email" required />

              <label style={styles.label}>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ ...styles.input, minHeight: 120, resize: "vertical" }}
                required
              />

              <button style={styles.button} type="submit">Submit</button>
            </form>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Support</h3>
            <div style={styles.infoLine}><b>Email:</b> support@healthcare.com</div>
            <div style={styles.infoLine}><b>Phone:</b> +94 11 234 5678</div>
            <div style={styles.infoLine}><b>Availability:</b> 24/7 Support</div>
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
    gridTemplateColumns: "1.4fr 1fr",
    gap: 14
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 18
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    color: "#111827"
  },
  form: {
    marginTop: 12,
    display: "grid",
    gap: 10
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#374151"
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
  button: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14
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
  infoLine: {
    marginTop: 12,
    color: "#374151",
    fontSize: 13,
    lineHeight: 1.8
  }
};
