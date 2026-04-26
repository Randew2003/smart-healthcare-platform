import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUser, isLoggedIn, logout } from "../utils/auth";
import logo from "../assets/logo.png";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  const user = getUser();
  const navigate = useNavigate();
  const authed = isLoggedIn();

  const role = user?.role || "";
  const isAdmin = authed && role === "admin";
  const isDoctor = authed && role === "doctor";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? "/admin/login" : "/");
  };

  // 🔥 NAV STYLE WITH UNDERLINE
  const navClass = ({ isActive }) =>
    `relative pb-1 text-[13px] font-medium transition-colors ${
      isActive
        ? "text-[#1F8DD6]"
        : "text-slate-700 hover:text-[#1F8DD6]"
    }
    after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-[#1F8DD6] after:transition-all after:duration-300
    ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}
  `;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md"
          : "border-b border-slate-100 bg-white"
      }`}
    >
      {/* 🔹 TOP BAR */}
      <div
        className={`overflow-hidden bg-[#2459A6] transition-all duration-300 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-9 opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-[12px] text-white lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-medium">24/7 Support</span>
            <span className="h-1 w-1 rounded-full bg-[#45B84A]" />
            <span>+94 11 234 5678</span>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/payments"
              className="text-[12px] font-medium hover:text-[#45B84A]"
            >
              Online Payments
            </Link>

            <Link
              to="/appointments"
              className="border-l border-white/30 pl-3 text-[12px] font-medium hover:text-[#45B84A]"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* 🔹 MAIN HEADER */}
      <div
        className={`mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center px-6 transition-all duration-300 lg:px-8 ${
          scrolled ? "py-2.5" : "py-3"
        }`}
      >
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Health Care Logo"
            className={`w-auto object-contain transition-all ${
              scrolled ? "h-[28px]" : "h-[34px]"
            }`}
          />
        </Link>

        {/* NAV */}
        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {!isAdmin && !isDoctor && (
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
          )}

          {isAdmin ? (
            <>
              <NavLink to="/admin" end className={navClass}>Dashboard</NavLink>
              <NavLink to="/admin/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/admin/users" className={navClass}>Users</NavLink>
              <NavLink to="/admin/doctors" className={navClass}>Doctors</NavLink>
            </>
          ) : isDoctor ? (
            <>
              <NavLink to="/doctor" end className={navClass}>Dashboard</NavLink>
              <NavLink to="/doctor/appointments" className={navClass}>Appointments</NavLink>
              {/* <NavLink to="/doctor/patients" className={navClass}>Patients</NavLink> */}
              <NavLink to="/doctor/prescriptions" className={navClass}>Prescriptions</NavLink>
              {/* <NavLink to="/doctor/telemedicine" className={navClass}>Telemedicine</NavLink> */}
              <NavLink to="/doctor/availability" className={navClass}>Availability</NavLink>
              <NavLink to="/doctor/profile" className={navClass}>Profile</NavLink>
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

        {/* 🔹 BUTTONS (slightly rounded) */}
        <div className="flex items-center gap-2">
          {authed ? (
            <button
              onClick={handleLogout}
              className="h-8 rounded-md border border-slate-300 px-3 text-[12px] font-medium text-slate-700 transition hover:bg-[#2459A6] hover:text-white"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-[12px] font-medium text-slate-700 transition hover:border-[#1F8DD6] hover:text-[#1F8DD6]"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="h-8 inline-flex items-center rounded-md bg-[#1F8DD6] px-4 text-[12px] font-medium text-white transition hover:bg-[#2459A6]"
              >
                Register
              </Link>

              <Link
                to="/register/doctor"
                className="hidden xl:inline-flex h-8 items-center rounded-md border border-[#45B84A] px-3 text-[12px] font-medium text-[#45B84A] transition hover:bg-[#45B84A] hover:text-white"
              >
                Doctor
              </Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="border-t border-slate-100 bg-white px-5 py-2 lg:hidden">
        <nav className="flex flex-wrap justify-center gap-5">
          {isAdmin ? (
            <>
              <NavLink to="/admin" end className={navClass}>Dashboard</NavLink>
              <NavLink to="/admin/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/admin/users" className={navClass}>Users</NavLink>
              <NavLink to="/admin/doctors" className={navClass}>Doctors</NavLink>
            </>
          ) : isDoctor ? (
            <>
              <NavLink to="/doctor" end className={navClass}>Dashboard</NavLink>
              <NavLink to="/doctor/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/doctor/patients" className={navClass}>Patients</NavLink>
              <NavLink to="/doctor/prescriptions" className={navClass}>Prescriptions</NavLink>
              {/* <NavLink to="/doctor/telemedicine" className={navClass}>Telemedicine</NavLink> */}
              <NavLink to="/doctor/availability" className={navClass}>Availability</NavLink>
              <NavLink to="/doctor/profile" className={navClass}>Profile</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" className={navClass}>Home</NavLink>
              <NavLink to="/doctors" className={navClass}>Doctors</NavLink>
              <NavLink to="/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/payments" className={navClass}>Payments</NavLink>
              <NavLink to="/services" className={navClass}>Services</NavLink>
              <NavLink to="/contact" className={navClass}>Contact</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}