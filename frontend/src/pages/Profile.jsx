import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { api } from "../utils/api";
import { getUser, isLoggedIn } from "../utils/auth";

export default function Profile() {
  const user = getUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const load = async () => {
    if (!isLoggedIn()) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get("/api/patients/me");
      setProfile(data);
      setFullName(data?.fullName || "");
      setEmail(data?.email || "");
      setPhone(data?.phone || "");
      setAddress(data?.address || "");
      setGender(data?.gender || "");
      setBloodGroup(data?.bloodGroup || "");
    } catch (err) {
      // If not created yet, that's ok.
      if (err?.response?.status === 404) {
        setProfile(null);
        return;
      }
      setError(err?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      setError("Please login first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!profile) {
        const { data } = await api.post("/api/patients/profile", {
          fullName,
          email,
          phone,
          address,
          gender,
          bloodGroup
        });
        setProfile(data?.patient);
        setMessage(data?.message || "Profile created.");
      } else {
        const { data } = await api.put("/api/patients/me", {
          fullName,
          email,
          phone,
          address,
          gender,
          bloodGroup
        });
        setProfile(data?.patient);
        setMessage(data?.message || "Profile updated.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Patient Profile</h2>
          <p style={styles.sub}>Manage your basic patient information.</p>
        </div>

        {!isLoggedIn() ? (
          <div style={styles.note}>Login to manage your profile.</div>
        ) : null}

        {error ? <div style={styles.error}>{error}</div> : null}
        {message ? <div style={styles.success}>{message}</div> : null}

        <div style={styles.card}>
          <div style={styles.topLine}>
            <div style={styles.tag}>{profile ? "Profile exists" : "No profile yet"}</div>
            <div style={styles.small}>
              User ID: <span style={styles.mono}>{user?.id || "-"}</span>
            </div>
          </div>

          <form onSubmit={save} style={styles.form}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Full name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} />
              </div>
            </div>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Gender</label>
                <input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Male/Female" style={styles.input} />
              </div>
            </div>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Blood group</label>
                <input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="O+" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
              </div>
            </div>

            <button disabled={loading} style={styles.button} type="submit">
              {loading ? "Saving..." : profile ? "Update profile" : "Create profile"}
            </button>
          </form>
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
  card: {
    marginTop: 18,
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 18
  },
  topLine: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" },
  tag: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(128,195,66,0.10)",
    border: "1px solid rgba(128,195,66,0.25)",
    color: "#2f6b14",
    fontSize: 12,
    fontWeight: 900
  },
  small: { color: "#4b5563", fontSize: 12 },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  form: { marginTop: 14, display: "grid", gap: 10 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
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
  error: {
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.08)",
    color: "#b91c1c",
    border: "1px solid rgba(239,68,68,0.18)",
    fontSize: 13
  },
  success: {
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(34,197,94,0.10)",
    color: "#166534",
    border: "1px solid rgba(34,197,94,0.20)",
    fontSize: 13
  },
  note: { marginTop: 14, color: "#4b5563", fontSize: 13 }
};
