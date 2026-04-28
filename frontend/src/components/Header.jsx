import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { getUser, isLoggedIn, logout } from "../utils/auth";
import { api } from "../utils/api";
import { useDoctorServiceId } from "../pages/doctor/doctorUtils";
import logo from "../assets/logo.png";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [unseenPrescriptionCount, setUnseenPrescriptionCount] = useState(0);
  const [unseenReportCount, setUnseenReportCount] = useState(0);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const authed = isLoggedIn();
  const { doctorId } = useDoctorServiceId();

  const role = user?.role || "";
  const isAdmin = authed && role === "admin";
  const isDoctor = authed && role === "doctor";
  const isPatient = authed && !isAdmin && !isDoctor;
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  
  // Gradient colors for each role
  const roleGradient = isAdmin 
    ? "bg-[linear-gradient(135deg,#2459A6_0%,#1F8DD6_58%,#45B84A_140%)]"
    : isDoctor
    ? "bg-[linear-gradient(135deg,#1F8DD6_0%,#2459A6_58%,#1F8DD6_140%)]"
    : "bg-[linear-gradient(135deg,#45B84A_0%,#2FA856_58%,#1F8DD6_140%)]";
  
  const roleConsoleLabel = isAdmin ? "Admin Console" : isDoctor ? "Doctor Portal" : "Patient Portal";
  const accountPanelWidth = "w-[18rem] sm:w-[20rem]";

  const accountDisplayName = useMemo(() => user?.fullName || roleLabel, [user?.fullName, roleLabel]);
  const accountDisplayEmail = useMemo(() => user?.email || "-", [user?.email]);
  const accountAvatarInitials = useMemo(() => {
    const source = accountDisplayName.trim();
    if (!source) return roleLabel[0]?.toUpperCase() || "U";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || roleLabel[0]?.toUpperCase() || "U";
  }, [accountDisplayName, roleLabel]);

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
    if (!accountMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen]);

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
    setAccountMenuOpen(false);
    navigate(isAdmin ? "/admin/login" : "/");
  };

  const handleAccountPlaceholderAction = () => {
    setAccountMenuOpen(false);
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
        <div className="flex items-center gap-2" ref={accountMenuRef}>
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

              {isAdmin || isDoctor || isPatient ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((open) => !open)}
                    className="inline-flex h-10 items-center gap-3 rounded-full border border-slate-200 bg-white px-3 pr-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#2459A6] hover:shadow-md"
                    aria-haspopup="menu"
                    aria-expanded={accountMenuOpen}
                    aria-label="Open account menu"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2459A6] to-[#45B84A] text-xs font-black uppercase text-white shadow-sm">
                      {accountAvatarInitials}
                    </span>
                    <span className="hidden min-w-0 flex-col sm:flex">
                      <span className="truncate text-[12px] font-semibold text-slate-800">{accountDisplayName}</span>
                      <span className="truncate text-[11px] text-slate-500">{roleLabel}</span>
                    </span>
                    <svg className={`h-4 w-4 text-slate-500 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {accountMenuOpen && (
                    <div className={`absolute right-0 top-[calc(100%+0.8rem)] z-50 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_70px_-26px_rgba(15,23,42,0.42)] ${accountPanelWidth}`}>
                      <div className={`${roleGradient} px-4 py-4 text-white`}>
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-black uppercase ring-1 ring-white/20 backdrop-blur-sm">
                            {accountAvatarInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15">
                              {roleConsoleLabel}
                            </div>
                            <div className="mt-1 truncate text-sm font-bold leading-tight">{accountDisplayName}</div>
                            <div className="truncate text-xs text-white/80">{accountDisplayEmail}</div>
                          </div>
                        </div>
                      </div>

                      <div className="border-b border-slate-100 px-3 py-3">
                        <div className="grid gap-2.5 text-xs">
                          <div className="rounded-lg bg-slate-50 px-3 py-2">
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Role</div>
                            <div className="mt-0.5 text-xs font-semibold text-slate-800">{roleLabel}</div>
                          </div>
                          <div className="rounded-lg bg-slate-50 px-3 py-2">
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Name</div>
                            <div className="mt-0.5 truncate text-xs font-semibold text-slate-800">{accountDisplayName}</div>
                          </div>
                          <div className="rounded-lg bg-slate-50 px-3 py-2">
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Email</div>
                            <div className="mt-0.5 truncate text-xs font-semibold text-slate-800">{accountDisplayEmail}</div>
                          </div>
                        </div>
                      </div>

                      <div className="px-2 py-2">
                        <button
                          type="button"
                          onClick={handleAccountPlaceholderAction}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 text-[11px] font-bold">P</span>
                          <span className="flex-1">Profile</span>
                          <span className="text-[10px] text-slate-400">Soon</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAccountPlaceholderAction}
                          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 text-[11px] font-bold">C</span>
                          <span className="flex-1">Change Password</span>
                          <span className="text-[10px] text-slate-400">Soon</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 text-[11px] font-bold">S</span>
                          <span className="flex-1">Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="h-8 rounded-md border border-slate-300 px-3 text-[12px] font-medium text-slate-700 transition hover:bg-[#2459A6] hover:text-white"
                >
                  Logout
                </button>
              )}
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
