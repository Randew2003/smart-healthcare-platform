import { Link, useNavigate } from "react-router-dom";
import { getUser, isLoggedIn, logout } from "../utils/auth";
import logo from "../assets/logo02.png";

export default function Header() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={styles.wrapper}>
      <div style={styles.topStrip}>
        <div style={styles.topLeft}>
          <span>24/7 Support</span>
          <span>•</span>
          <span>+94 11 234 5678</span>
        </div>

        <div style={styles.topRight}>
          <button style={styles.ghostButton}>Online Payments</button>
          <button style={styles.primaryButton}>Book Appointment</button>
        </div>
      </div>

      <div style={styles.mainBar}>
        <img src={logo} alt="logo" style={styles.logo} />

        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/appointments" style={styles.navLink}>Appointments</Link>
          <Link to="/telemedicine" style={styles.navLink}>Telemedicine</Link>
          <Link to="/services" style={styles.navLink}>Services</Link>
          <Link to="/contact" style={styles.navLink}>Contact</Link>
        </nav>

        <div style={styles.actions}>
          {isLoggedIn() ? (
            <>
              <span style={styles.userText}>{user?.fullName}</span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.authLink}>Login</Link>
              <Link to="/register" style={styles.authLink}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    fontFamily: "'Archivo', sans-serif"
  },

  topStrip: {
    width: "100%",
    padding: "10px 170px",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
    fontSize: "13px",
    boxSizing: "border-box"
  },

  topLeft: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },

  topRight: {
    display: "flex",
    gap: "12px",
    alignItems: "center"
  },

  ghostButton: {
    border: "1px solid rgba(255,255,255,0.45)",
    background: "transparent",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    fontFamily: "'Archivo', sans-serif",
    fontSize: "13px"
  },

  primaryButton: {
    border: "none",
    background: "#fff",
    color: "#80c342",
    padding: "6px 16px",
    borderRadius: "20px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Archivo', sans-serif",
    fontSize: "13px"
  },

  mainBar: {
    width: "100%",
    padding: "6px 170px",
    minHeight: "52px",
    display: "grid",
    gridTemplateColumns: "150px 1fr auto",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #ececec",
    boxSizing: "border-box",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
  },

  logo: {
    width: "108px",
    display: "block"
  },

  nav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap"
  },

  navLink: {
    textDecoration: "none",
    color: "#2f2f2f",
    fontSize: "13px",
    fontWeight: 500
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },

  authLink: {
    textDecoration: "none",
    color: "#2f2f2f",
    fontSize: "13px",
    fontWeight: 500
  },

  userText: {
    fontSize: "13px",
    color: "#4b5563",
    fontWeight: 500
  },

  logoutButton: {
    background: "#fbb033",
    color: "#fff",
    border: "none",
    padding: "7px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Archivo', sans-serif",
    fontSize: "12px"
  }
};