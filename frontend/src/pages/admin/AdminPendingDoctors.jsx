import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";

export default function AdminPendingDoctors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/admin/doctors/pending");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load pending doctors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(doctor, status) {
    const id = doctor?._id;
    if (!id) return;

    setBusyId(id);
    setError("");

    try {
      await api.patch(`/api/admin/doctors/${id}/verify`, { status });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update doctor status.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Pending Doctors</h2>
          <p style={styles.sub}>Verify or reject doctor accounts.</p>
        </div>

        {loading ? <div style={styles.note}>Loading...</div> : null}
        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.list}>
          {items.length === 0 && !loading ? (
            <div style={styles.empty}>No pending doctors.</div>
          ) : null}

          {items.map((d) => {
            const id = d?._id;
            const isBusy = busyId === id;

            return (
              <div key={id} style={styles.row}>
                <div style={styles.rowMain}>
                  <div style={styles.name}>{d?.fullName || "Doctor"}</div>
                  <div style={styles.meta}>
                    <span style={styles.metaItem}>{d?.email || "—"}</span>
                    {d?.doctorApplication?.specialization ? (
                      <span style={styles.metaItem}>• {d.doctorApplication.specialization}</span>
                    ) : null}
                    {d?.doctorApplication?.licenseNumber ? (
                      <span style={styles.metaItem}>• License: {d.doctorApplication.licenseNumber}</span>
                    ) : null}
                  </div>
                </div>

                <div style={styles.rowActions}>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setStatus(d, "verified")}
                    style={styles.verifyBtn}
                  >
                    {isBusy ? "Working..." : "Verify"}
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setStatus(d, "rejected")}
                    style={styles.rejectBtn}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
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
  list: {
    marginTop: 16,
    display: "grid",
    gap: 12
  },
  row: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  rowMain: { minWidth: 0 },
  name: { fontSize: 15, fontWeight: 900, color: "#111827" },
  meta: { marginTop: 6, color: "#6b7280", fontSize: 12, lineHeight: 1.6 },
  metaItem: { marginRight: 8 },
  rowActions: { display: "flex", gap: 10, whiteSpace: "nowrap" },
  verifyBtn: {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid rgba(34,197,94,0.25)",
    background: "rgba(34,197,94,0.12)",
    color: "#166534",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer"
  },
  rejectBtn: {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.22)",
    background: "rgba(239,68,68,0.10)",
    color: "#b91c1c",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer"
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
  empty: {
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "#fff",
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center"
  }
};
