import MainLayout from "../layouts/MainLayout";

const items = [
  {
    title: "Doctor Appointments",
    text: "Find verified doctors, check availability, and book appointments securely."
  },
  {
    title: "Telemedicine Consultations",
    text: "Join online sessions and access care from anywhere with meeting links."
  },
  {
    title: "Medical Records (Patient Portal)",
    text: "Manage your profile, medical history, prescriptions, and reports."
  },
  {
    title: "Secure Online Payments",
    text: "Pay for appointments using PayHere sandbox with verified server-side hashing."
  },
  {
    title: "Smart Notifications",
    text: "Receive notifications and alerts (email sending is optional in dev)."
  }
];

export default function Services() {
  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <h2 style={styles.title}>Our Services</h2>
          <p style={styles.sub}>
            A premium digital healthcare experience built around convenience, safety, and trust.
          </p>
        </div>

        <div style={styles.grid}>
          {items.map((it) => (
            <div key={it.title} style={styles.card}>
              <div style={styles.cardTop} />
              <h3 style={styles.cardTitle}>{it.title}</h3>
              <p style={styles.cardText}>{it.text}</p>
            </div>
          ))}
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
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
    padding: 18,
    overflow: "hidden"
  },
  cardTop: {
    height: 6,
    borderRadius: 999,
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    width: 70,
    marginBottom: 12
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    color: "#111827"
  },
  cardText: {
    margin: "10px 0 0 0",
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 1.8
  }
};
