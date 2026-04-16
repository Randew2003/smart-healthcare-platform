import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function NotFound() {
  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Page not found</h2>
          <p style={styles.sub}>The page you’re looking for doesn’t exist.</p>
          <Link to="/" style={styles.button}>Go Home</Link>
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
    maxWidth: 680,
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 18px 60px rgba(0,0,0,0.08)",
    border: "1px solid rgba(128,195,66,0.15)",
    padding: 26
  },
  title: {
    margin: 0,
    fontSize: 26,
    color: "#111827"
  },
  sub: {
    margin: "10px 0 0 0",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.8
  },
  button: {
    display: "inline-block",
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
    textDecoration: "none"
  }
};
