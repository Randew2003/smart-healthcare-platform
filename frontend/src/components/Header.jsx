import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getUser, isLoggedIn, logout } from "../utils/auth";
import { api } from "../utils/api";
import { useDoctorServiceId } from "../pages/doctor/doctorUtils";
import logo from "../assets/logo.png";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [unseenPrescriptionCount, setUnseenPrescriptionCount] = useState(0);
  const [unseenReportCount, setUnseenReportCount] = useState(0);

  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const authed = isLoggedIn();
  const { doctorId } = useDoctorServiceId();

  const role = user?.role || "";
  const isAdmin = authed && role === "admin";
  const isDoctor = authed && role === "doctor";
  const isPatient = authed && !isAdmin && !isDoctor;

  const patientId = useMemo(() => {
    if (!isPatient) return "";
    return user?.id || user?._id || "";
  }, [isPatient, user?.id, user?._id]);

  const prescriptionsSeenKey = useMemo(() => {
    if (!patientId) return "";
    return `patient:lastSeenPrescriptionAt:${patientId}`;
  }, [patientId]);

  const reportsSeenKey = useMemo(() => {
    if (!doctorId) return "";
    return `doctor:lastSeenReportAt:${doctorId}`;
  }, [doctorId]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isPatient || !patientId || !prescriptionsSeenKey) return;

    let cancelled = false;

    const getLastSeen = () => {
      const raw = localStorage.getItem(prescriptionsSeenKey);
      const ts = raw ? Date.parse(raw) : NaN;
      return Number.isFinite(ts) ? ts : 0;
    };

    const computeUnseen = async () => {
      try {
        const lastSeen = getLastSeen();
        const { data } = await api.get(
          `/api/prescriptions/patient/${encodeURIComponent(patientId)}`
        );

        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        const unseen = list.filter((item) => {
          const createdAtRaw = item?.createdAt;
          const createdAt = createdAtRaw ? Date.parse(createdAtRaw) : NaN;
          return Number.isFinite(createdAt) ? createdAt > lastSeen : false;
        }).length;

        if (!cancelled) setUnseenPrescriptionCount(unseen);
      } catch {
        if (!cancelled) setUnseenPrescriptionCount(0);
      }
    };

    computeUnseen();

    const onSeen = () => {
      computeUnseen();
    };
    window.addEventListener("prescriptions:seen", onSeen);

    const interval = window.setInterval(computeUnseen, 30000);

    return () => {
      cancelled = true;
      window.removeEventListener("prescriptions:seen", onSeen);
      window.clearInterval(interval);
    };
  }, [isPatient, patientId, prescriptionsSeenKey]);

  useEffect(() => {
    if (!isDoctor || !doctorId || !reportsSeenKey) return;

    let cancelled = false;

    const getLastSeen = () => {
      const raw = localStorage.getItem(reportsSeenKey);
      const ts = raw ? Date.parse(raw) : NaN;
      return Number.isFinite(ts) ? ts : 0;
    };

    const computeUnseen = async () => {
      try {
        const lastSeen = getLastSeen();
        const { data } = await api.get(
          `/api/patients/doctor-view/reports?doctorId=${encodeURIComponent(doctorId)}`
        );

        const list = Array.isArray(data) ? data : [];
        const unseen = list.filter((item) => {
          const uploadedAtRaw = item?.uploadedAt;
          const uploadedAt = uploadedAtRaw ? Date.parse(uploadedAtRaw) : NaN;
          return Number.isFinite(uploadedAt) ? uploadedAt > lastSeen : false;
        }).length;

        if (!cancelled) setUnseenReportCount(unseen);
      } catch {
        if (!cancelled) setUnseenReportCount(0);
      }
    };

    computeUnseen();

    const onSeen = () => {
      computeUnseen();
    };

    window.addEventListener("doctorReports:seen", onSeen);
    const interval = window.setInterval(computeUnseen, 30000);

    return () => {
      cancelled = true;
      window.removeEventListener("doctorReports:seen", onSeen);
      window.clearInterval(interval);
    };
  }, [doctorId, isDoctor, reportsSeenKey]);

  useEffect(() => {
    if (!isDoctor || !doctorId || !reportsSeenKey) return;
    if (location.pathname !== "/doctor/reports") return;

    localStorage.setItem(reportsSeenKey, new Date().toISOString());
    window.dispatchEvent(new Event("doctorReports:seen"));
  }, [doctorId, isDoctor, location.pathname, reportsSeenKey]);

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? "/admin/login" : "/");
  };

  const handlePrescriptionBellClick = () => {
    if (!prescriptionsSeenKey) return;
    localStorage.setItem(prescriptionsSeenKey, new Date().toISOString());
    setUnseenPrescriptionCount(0);
  };

  const handleDoctorReportBellClick = () => {
    if (!reportsSeenKey) return;
    localStorage.setItem(reportsSeenKey, new Date().toISOString());
    setUnseenReportCount(0);
    window.dispatchEvent(new Event("doctorReports:seen"));
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
              <NavLink to="/doctor/prescriptions" className={navClass}>Prescription History</NavLink>
              <NavLink to="/doctor/reports" className={navClass}>Reports</NavLink>
              {/* <NavLink to="/doctor/telemedicine" className={navClass}>Telemedicine</NavLink> */}
              <NavLink to="/doctor/availability" className={navClass}>Availability</NavLink>
              <NavLink to="/doctor/profile" className={navClass}>Profile</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/doctors" className={navClass}>Doctors</NavLink>
              <NavLink to="/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/prescriptions" className={navClass}>Prescriptions</NavLink>
              <NavLink to="/payments" className={navClass}>Payments</NavLink>
              <NavLink to="/services" className={navClass}>Services</NavLink>
              <NavLink to="/contact" className={navClass}>Contact</NavLink>
            </>
          )}
        </nav>

        {/* 🔹 BUTTONS (slightly rounded) */}
        <div className="flex items-center gap-2">
          {authed ? (
            <>
              {isPatient && (
                <Link
                  to="/prescriptions"
                  onClick={handlePrescriptionBellClick}
                  className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-[#2459A6] hover:text-white"
                  aria-label="Prescription notifications"
                  title="Prescription notifications"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 21a2 2 0 0 1-4 0"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7"
                    />
                  </svg>

                  {unseenPrescriptionCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#45B84A] px-1 text-[10px] font-bold leading-none text-white">
                      {unseenPrescriptionCount > 9 ? "9+" : unseenPrescriptionCount}
                    </span>
                  )}
                </Link>
              )}

              {isDoctor && (
                <Link
                  to="/doctor/reports"
                  onClick={handleDoctorReportBellClick}
                  className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-[#2459A6] hover:text-white"
                  aria-label="Report notifications"
                  title="Report notifications"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 21a2 2 0 0 1-4 0"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7"
                    />
                  </svg>

                  {unseenReportCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f97316] px-1 text-[10px] font-bold leading-none text-white">
                      {unseenReportCount > 9 ? "9+" : unseenReportCount}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="h-8 rounded-md border border-slate-300 px-3 text-[12px] font-medium text-slate-700 transition hover:bg-[#2459A6] hover:text-white"
              >
                Logout
              </button>
            </>
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
              <NavLink to="/doctor/prescriptions" className={navClass}>Prescription History</NavLink>
              <NavLink to="/doctor/reports" className={navClass}>Reports</NavLink>
              {/* <NavLink to="/doctor/telemedicine" className={navClass}>Telemedicine</NavLink> */}
              <NavLink to="/doctor/availability" className={navClass}>Availability</NavLink>
              <NavLink to="/doctor/profile" className={navClass}>Profile</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" className={navClass}>Home</NavLink>
              <NavLink to="/doctors" className={navClass}>Doctors</NavLink>
              <NavLink to="/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/prescriptions" className={navClass}>Prescriptions</NavLink>
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
