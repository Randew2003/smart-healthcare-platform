import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { getUser, isLoggedIn, logout } from "../utils/auth";
import logo from "../assets/logo02.png";

export default function Header() {
  const user = getUser();
  const navigate = useNavigate();
  const authed = isLoggedIn();
  const role = user?.role;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = authed && role === "admin";
  const isDoctor = authed && role === "doctor";
  const displayName = user?.fullName || user?.email || "User";

  const navigation = useMemo(() => {
    if (isAdmin) {
      return [
        { label: "Dashboard", to: "/admin" },
        { label: "Appointments", to: "/admin/appointments" },
        { label: "Users", to: "/admin/users" },
        { label: "Pending Doctors", to: "/admin/doctors" },
      ];
    }

    if (isDoctor) {
      return [
        { label: "Home", to: "/" },
        { label: "Appointments", to: "/appointments" },
        { label: "Telemedicine", to: "/telemedicine" },
        { label: "Services", to: "/services" },
        { label: "Contact", to: "/contact" },
      ];
    }

    return [
      { label: "Home", to: "/" },
      { label: "Doctors", to: "/doctors" },
      { label: "Appointments", to: "/appointments" },
      { label: "Payments", to: "/payments" },
      { label: "Services", to: "/services" },
      { label: "Contact", to: "/contact" },
    ];
  }, [isAdmin, isDoctor]);

  const quickActions = useMemo(() => {
    if (isAdmin) {
      return [
        { label: "Dashboard", to: "/admin", variant: "secondary" },
        { label: "Appointments", to: "/admin/appointments", variant: "secondary" },
        { label: "Users", to: "/admin/users", variant: "secondary" },
        { label: "Verify Doctors", to: "/admin/doctors", variant: "primary" },
      ];
    }

    if (isDoctor) {
      return [
        { label: "Telemedicine", to: "/telemedicine", variant: "secondary" },
        { label: "Appointments", to: "/appointments", variant: "primary" },
      ];
    }

    return [
      { label: "Get Started", to: "/register", variant: "primary" },
      { label: "Register as a Doctor", to: "/register/doctor", variant: "secondary" },
      { label: "Login", to: "/login", variant: "ghost" },
    ];
  }, [isAdmin, isDoctor]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const navLinkClasses = ({ isActive }) =>
    [
      "relative inline-flex items-center px-1 py-2 text-sm font-medium transition-all duration-200",
      isActive
        ? "text-lime-700 after:absolute after:-bottom-[10px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-lime-600"
        : "text-slate-700 hover:text-lime-700",
    ].join(" ");

  const mobileNavLinkClasses = ({ isActive }) =>
    [
      "block rounded-xl px-4 py-3 text-sm font-medium transition",
      isActive
        ? "bg-lime-50 text-lime-700"
        : "text-slate-700 hover:bg-slate-50 hover:text-lime-700",
    ].join(" ");

  const actionButtonClasses = (variant = "secondary") =>
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-lime-600 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-lime-700 hover:to-amber-600"
      : variant === "ghost"
        ? "inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
        : "inline-flex items-center justify-center rounded-full border border-lime-200 bg-lime-50 px-4 py-2 text-sm font-semibold text-lime-700 shadow-sm transition hover:border-lime-300 hover:bg-lime-100 hover:text-lime-800";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Top utility bar */}
      <div className="hidden w-full bg-linear-to-r from-lime-600 via-lime-500 to-amber-400 text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 xl:px-8">
          <div className="flex items-center gap-3 text-sm font-medium">
            <span>24/7 Support</span>
            <span className="text-white/70">•</span>
            <span>+94 11 234 5678</span>
            <span className="text-white/70">•</span>
            <span>support@healthcare.com</span>
          </div>

        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="healthCare logo"
            className="h-11 w-auto object-contain sm:h-12"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/" || item.to === "/admin"}
              className={navLinkClasses}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth / profile */}
        <div className="hidden items-center gap-3 lg:flex">
          {authed ? (
            <>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-100 text-sm font-bold text-lime-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="leading-tight">
                  <p className="max-w-45 truncate text-sm font-semibold text-slate-800">
                    {displayName}
                  </p>
                  <p className="text-xs capitalize text-slate-500">
                    {role || "member"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {quickActions.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={actionButtonClasses(item.variant)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden"
          aria-label="Toggle navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6">
            <div className="rounded-2xl bg-linear-to-r from-lime-600 via-lime-500 to-amber-400 p-4 text-white shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>24/7 Support</span>
                <span className="text-white/70">•</span>
                <span>+94 11 234 5678</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickActions.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      item.variant === "primary"
                        ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-lime-700"
                        : item.variant === "ghost"
                          ? "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                          : "rounded-full border border-lime-200 bg-lime-50 px-4 py-2 text-sm font-semibold text-lime-700"
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === "/" || item.to === "/admin"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClasses}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-slate-200 pt-4">
              {authed ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                    <p className="text-xs capitalize text-slate-500">{role || "member"}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-linear-to-r from-lime-600 to-amber-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/register?role=doctor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-lime-200 bg-white px-4 py-3 text-center text-sm font-semibold text-lime-700 shadow-sm"
                  >
                    Register as a Doctor
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:border-lime-600 hover:text-lime-700"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}