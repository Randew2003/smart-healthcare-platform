import { Link } from "react-router-dom";
import logo from "../assets/logo01.png";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.left}>
          <img src={logo} alt="healthCare" style={styles.logo} />

          <p style={styles.description}>
            healthCare is a smart healthcare platform for appointments,
            telemedicine, medical records, and secure online payments.
          </p>

         
        </div>

        <div style={styles.right}>
          <div style={styles.linksGrid}>
            <div>
              <h3 style={styles.heading}>QUICK LINKS</h3>
              <ul style={styles.list}>
                <li><Link to="/" style={styles.link}>Home</Link></li>
                <li><Link to="/doctors" style={styles.link}>Doctors</Link></li>
                <li><Link to="/services" style={styles.link}>Services</Link></li>
                <li><Link to="/contact" style={styles.link}>Contact</Link></li>
                <li><Link to="/login" style={styles.link}>Login</Link></li>
                <li><Link to="/register" style={styles.link}>Register</Link></li>
              </ul>
            </div>

            <div>
              <h3 style={styles.heading}>SERVICES</h3>
              <ul style={styles.list}>
                <li><Link to="/appointments" style={styles.link}>Appointments</Link></li>
                <li><Link to="/telemedicine" style={styles.link}>Telemedicine</Link></li>
                <li><Link to="/payments" style={styles.link}>Payments</Link></li>
                <li><Link to="/profile" style={styles.link}>Medical Records</Link></li>
              </ul>
            </div>

            <div>
              <h3 style={styles.heading}>SUPPORT</h3>
              <ul style={styles.list}>
                <li>support@healthcare.com</li>
                <li>+94 11 234 5678</li>
                <li>24/7 Support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <p>© 2026 healthCare. All Rights Reserved.</p>
        <p>We Protect Your Health</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    width: "100%",
    backgroundColor: "#60a421",
    color: "#fff",
    marginTop: "40px",
    fontFamily: "'Archivo', sans-serif"
  },

  container: {
    width: "100%",
    padding: "50px 170px 35px 170px",
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "1.1fr 1.9fr",
    gap: "80px",
    alignItems: "start"
  },

  left: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    maxWidth: "420px"
  },

  logo: {
    width: "220px"
  },

  description: {
    fontSize: "15px",
    lineHeight: "1.9",
    fontWeight: 300,
    opacity: 0.96
  },

  contact: {
    fontSize: "18px",
    fontWeight: 600,
    marginTop: "4px",
    cursor: "pointer"
  },

  right: {
    width: "100%"
  },

  linksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "60px"
  },

  heading: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "16px"
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontSize: "16px",
    lineHeight: "1.6"
  },

  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 400
  },

  bottomBar: {
    width: "100%",
    padding: "18px 170px",
    boxSizing: "border-box",
    borderTop: "1px solid rgba(255,255,255,0.22)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    fontSize: "15px",
    fontWeight: 300
  }
};