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

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? "/admin/login" : "/login");
  };

  // ✅ NAV STYLE FOR BLUE BAR
  const navClass = ({ isActive }) =>
    `text-[13px] font-medium pb-2 border-b-2 transition ${
      isActive
        ? "border-white text-white"
        : "border-transparent text-white/90 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full font-sans">

      {/* 🔹 TOP BAR */}
      <div className="flex justify-between items-center px-6 lg:px-32 py-2 text-white text-[13px] bg-[#00bbb3]">
        
        {/* Left */}
        <div className="flex items-center gap-2">
          <span>24/7 Support</span>
          <span>•</span>
          <span>+94 11 234 5678</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {isAdmin ? (
            <>
              <Link to="/admin" className="px-3 py-1 rounded-full border border-white/50 hover:bg-white/10">
                Dashboard
              </Link>
              <Link to="/admin/appointments" className="px-3 py-1 rounded-full border border-white/50 hover:bg-white/10">
                Appointments
              </Link>
              <Link to="/admin/users" className="px-3 py-1 rounded-full border border-white/50 hover:bg-white/10">
                Users
              </Link>
              <Link to="/admin/doctors" className="px-3 py-1 rounded-full bg-white text-[#0070cd] font-semibold">
                Verify Doctors
              </Link>
            </>
          ) : isDoctor ? (
            <>
              <Link to="/telemedicine" className="px-3 py-1 rounded-full border border-white/50 hover:bg-white/10">
                Telemedicine
              </Link>
              <Link to="/appointments" className="px-3 py-1 rounded-full bg-white text-[#0070cd] font-semibold">
                Appointments
              </Link>
            </>
          ) : (
            <>
              <Link to="/payments" className="px-3 py-1 rounded-full border border-white/50 hover:bg-white/10">
                Online Payments
              </Link>
              <Link to="/appointments" className="px-3 py-1 rounded-full bg-white text-[#0070cd] font-semibold">
                Book Appointment
              </Link>
            </>
          )}

        </div>
      </div>

      {/* 🔹 MAIN NAV BAR */}
      <div className="grid grid-cols-[120px_1fr_auto] items-center px-6 lg:px-32 py-3 bg-[#0070cd] text-white">

        {/* Logo */}
        <img src={logo} alt="logo" className="w-[100px]" />

        {/* Navigation */}
        <nav className="flex justify-center gap-6 flex-wrap">

          {!isAdmin && (
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
          )}

          {isAdmin ? (
            <>
              <NavLink to="/admin" end className={navClass}>Dashboard</NavLink>
              <NavLink to="/admin/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/admin/users" className={navClass}>Users</NavLink>
              <NavLink to="/admin/doctors" className={navClass}>Pending Doctors</NavLink>
            </>
          ) : isDoctor ? (
            <>
              <NavLink to="/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/telemedicine" className={navClass}>Telemedicine</NavLink>
              <NavLink to="/services" className={navClass}>Services</NavLink>
              <NavLink to="/contact" className={navClass}>Contact</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/doctors" className={navClass}>Doctors</NavLink>
              <NavLink to="/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/payments" className={navClass}>Payments</NavLink>
              <NavLink to="/services" className={navClass}>Services</NavLink>
              <NavLink to="/contact" className={navClass}>Contact</NavLink>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {authed ? (
            <>
              <span className="text-[13px] text-white/90">
                {user?.fullName || user?.email || "User"}
                {role && ` (${role})`}
              </span>

              <button
                onClick={handleLogout}
                className="bg-white text-[#0070cd] px-3 py-1 rounded-md text-[12px] font-semibold hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="whitespace-nowrap rounded-md border border-white/50 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0070cd] transition hover:bg-gray-100"
              >
                Register
              </Link>
              <Link
                to="/register/doctor"
                className="whitespace-nowrap rounded-md border border-white/50 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-white/10"
              >
                Register as Doctor
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}
