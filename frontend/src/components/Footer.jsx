import { Link } from "react-router-dom";
import logo from "../assets/logo01.png";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Doctors", to: "/doctors" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
  { label: "Login", to: "/login" },
  { label: "Register", to: "/register" },
];

const servicesLinks = [
  { label: "Appointments", to: "/appointments" },
  { label: "Telemedicine", to: "/telemedicine" },
  { label: "Payments", to: "/payments" },
  { label: "Medical Records", to: "/profile" },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-br from-lime-700 via-lime-600 to-lime-800 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
        {/* Brand section */}
        <div className="lg:col-span-4">
          <div className="mb-6">
            <img
              src={logo}
              alt="healthCare"
              className="h-14 w-auto object-contain sm:h-16"
            />
          </div>

          <p className="max-w-md text-sm leading-7 text-white/90 sm:text-[15px]">
            healthCare is a smart healthcare platform for appointments,
            telemedicine, medical records, and secure online payments.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                📧
              </span>
              <span>support@healthcare.com</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                📞
              </span>
              <span>+94 11 234 5678</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                ⏰
              </span>
              <span>24/7 Support Available</span>
            </div>
          </div>
        </div>

        {/* Links area */}
        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-white/95">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-white/85 transition hover:translate-x-1 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-white/95">
              Services
            </h3>

            <ul className="space-y-3">
              {servicesLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-white/85 transition hover:translate-x-1 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-white/95">
              Support
            </h3>

            <ul className="space-y-3 text-sm text-white/85">
              <li>support@healthcare.com</li>
              <li>+94 11 234 5678</li>
              <li>24/7 Customer Care</li>
              <li>Secure Health Data Protection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-white/80 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 healthCare. All Rights Reserved.</p>
          <p>We Protect Your Health</p>
        </div>
      </div>
    </footer>
  );
}
