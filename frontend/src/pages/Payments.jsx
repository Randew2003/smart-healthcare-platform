import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { api } from "../utils/api";
import { getUser, isLoggedIn } from "../utils/auth";
import { submitPayHereCheckout } from "../utils/payhereCheckout";

export default function Payments() {
  const user = getUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);

  const [appointmentId, setAppointmentId] = useState("");
  const [amount, setAmount] = useState(1500);
  const [creating, setCreating] = useState(false);

  const loadMyPayments = async () => {
    if (!isLoggedIn()) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/payments/my");
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payments.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyPayments();
  }, []);

  const createPayment = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      setError("Please login first.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const { data } = await api.post("/api/payments", {
        appointmentId,
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        amount
      });

      submitPayHereCheckout(data?.payhere);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create payment.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Payments</h2>
          <p style={styles.sub}>Create PayHere payments and view your payment history.</p>
        </div>

        {!isLoggedIn() ? (
          <div style={styles.note}>Login to make payments.</div>
        ) : null}

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Pay for an appointment</h3>
            <form onSubmit={createPayment} style={styles.form}>
              <label style={styles.label}>Appointment ID</label>
              <input value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} style={styles.input} required />

              <label style={styles.label}>Amount (LKR)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value || 0))}
                type="number"
                min={1}
                style={styles.input}
                required
              />

              <button disabled={creating} style={styles.button} type="submit">
                {creating ? "Redirecting..." : "Pay with PayHere"}
              </button>
            </form>

            <p style={styles.help}>
              PayHere redirect return URLs: <b>/payment-success</b> and <b>/payment-cancel</b>
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.headerRow}>
              <h3 style={styles.cardTitle}>My payments</h3>
              <button onClick={loadMyPayments} style={styles.smallBtn}>Refresh</button>
            </div>

            {loading ? <div style={styles.note}>Loading...</div> : null}

            <div style={styles.list}>
              {payments.map((p) => (
                <div key={p._id} style={styles.row}>
                  <div style={styles.rowTitle}>
                    {p.status}
                    <span style={styles.mono}>{p.orderId}</span>
                  </div>
                  <div style={styles.rowMeta}><b>Appointment:</b> <span style={styles.mono}>{p.appointmentId}</span></div>
                  <div style={styles.rowMeta}><b>Amount:</b> {p.amount} {p.currency}</div>
                  <div style={styles.rowMeta}><b>Date:</b> {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</div>
                </div>
              ))}

              {!loading && payments.length === 0 ? (
                <div style={styles.note}>No payments yet.</div>
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
  help: { margin: "10px 0 0 0", color: "#4b5563", fontSize: 12, lineHeight: 1.6 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  smallBtn: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(128,195,66,0.25)",
    background: "rgba(128,195,66,0.10)",
    color: "#2f6b14",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12
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
  note: { marginTop: 14, color: "#4b5563", fontSize: 13 }
};
