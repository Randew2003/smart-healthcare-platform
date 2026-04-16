import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUser, isLoggedIn, logout } from "../utils/auth";
import logo from "../assets/logo02.png";

export default function Header() {
  const user = getUser();
  const navigate = useNavigate();
  const authed = isLoggedIn();
  const role = user?.role;
  const isAdmin = authed && role === "admin";
  const isDoctor = authed && role === "doctor";

  const navLinkStyle = ({ isActive }) => ({
    ...styles.navLink,
    borderBottom: isActive ? "2px solid #80c342" : "2px solid transparent",
    paddingBottom: 8,
    color: isActive ? "#2f6b14" : styles.navLink.color
  });

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
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                style={{ ...styles.ghostButton, textDecoration: "none", display: "inline-block" }}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/appointments"
                style={{ ...styles.ghostButton, textDecoration: "none", display: "inline-block" }}
              >
                Appointments
              </Link>
              <Link
                to="/admin/users"
                style={{ ...styles.ghostButton, textDecoration: "none", display: "inline-block" }}
              >
                Users
              </Link>
              <Link
                to="/admin/doctors"
                style={{ ...styles.primaryButton, textDecoration: "none", display: "inline-block" }}
              >
                Verify Doctors
              </Link>
            </>
          ) : isDoctor ? (
            <>
              <Link
                to="/telemedicine"
                style={{ ...styles.ghostButton, textDecoration: "none", display: "inline-block" }}
              >
                Telemedicine
              </Link>
              <Link
                to="/appointments"
                style={{ ...styles.primaryButton, textDecoration: "none", display: "inline-block" }}
              >
                Appointments
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/payments"
                style={{ ...styles.ghostButton, textDecoration: "none", display: "inline-block" }}
              >
                Online Payments
              </Link>
              <Link
                to="/book-appointment"
                style={{ ...styles.primaryButton, textDecoration: "none", display: "inline-block" }}
              >
                Book Appointment
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={styles.mainBar}>
        <img src={logo} alt="logo" style={styles.logo} />

        <nav style={styles.nav}>
          {!isAdmin ? <NavLink to="/" end style={navLinkStyle}>Home</NavLink> : null}

          {isAdmin ? (
            <>
              <NavLink to="/admin" end style={navLinkStyle}>Dashboard</NavLink>
              <NavLink to="/admin/appointments" style={navLinkStyle}>Appointments</NavLink>
              <NavLink to="/admin/users" style={navLinkStyle}>Users</NavLink>
              <NavLink to="/admin/doctors" style={navLinkStyle}>Pending Doctors</NavLink>
            </>
          ) : isDoctor ? (
            <>
              <NavLink to="/appointments" style={navLinkStyle}>Appointments</NavLink>
              <NavLink to="/telemedicine" style={navLinkStyle}>Telemedicine</NavLink>
              <NavLink to="/services" style={navLinkStyle}>Services</NavLink>
              <NavLink to="/contact" style={navLinkStyle}>Contact</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/doctors" style={navLinkStyle}>Doctors</NavLink>
              <NavLink to="/appointments" style={navLinkStyle}>Appointments</NavLink>
              <NavLink to="/payments" style={navLinkStyle}>Payments</NavLink>
              <NavLink to="/services" style={navLinkStyle}>Services</NavLink>
              <NavLink to="/contact" style={navLinkStyle}>Contact</NavLink>
            </>
          )}
        </nav>

        <div style={styles.actions}>
          {authed ? (
            <>
              <span style={styles.userText}>
                {user?.fullName || user?.email || "User"}{role ? ` (${role})` : ""}
              </span>
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
    display: "inline-block",
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