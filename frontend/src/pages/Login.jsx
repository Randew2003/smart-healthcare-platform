import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { api } from "../utils/api";
import { setAuth } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const info = location?.state?.info || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password
      });

      setAuth({ token: data?.token, user: data?.user });

      const role = data?.user?.role;
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "patient" || role === "doctor") {
        navigate("/appointments");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.head}>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.sub}>Login to manage appointments, telemedicine and payments.</p>
          </div>

          {info ? <div style={styles.info}>{info}</div> : null}
          {error ? <div style={styles.error}>{error}</div> : null}

          <form onSubmit={onSubmit} style={styles.form}>
            <label style={styles.label}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              required
              style={styles.input}
            />

            <button disabled={loading} style={styles.button} type="submit">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={styles.footerText}>
            Don’t have an account? <Link to="/register" style={styles.link}>Register</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 160px)",
    padding: "40px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 18px 60px rgba(0,0,0,0.08)",
    border: "1px solid rgba(128,195,66,0.15)",
    overflow: "hidden"
  },
  head: {
    padding: "26px 26px 18px 26px",
    background: "linear-gradient(135deg, rgba(128,195,66,0.16), rgba(251,176,51,0.14))"
  },
  title: {
    margin: 0,
    fontSize: 26,
    color: "#1f2937"
  },
  sub: {
    margin: "10px 0 0 0",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.7
  },
  info: {
    margin: "18px 26px 0 26px",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(34,197,94,0.10)",
    color: "#166534",
    border: "1px solid rgba(34,197,94,0.20)",
    fontSize: 13
  },
  error: {
    margin: "18px 26px 0 26px",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.08)",
    color: "#b91c1c",
    border: "1px solid rgba(239,68,68,0.18)",
    fontSize: 13
  },
  form: {
    padding: 26,
    display: "grid",
    gap: 12
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
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
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  footerText: {
    padding: "0 26px 26px 26px",
    margin: 0,
    color: "#4b5563",
    fontSize: 13
  },
  link: {
    color: "#60a421",
    fontWeight: 700,
    textDecoration: "none"
  }
};
