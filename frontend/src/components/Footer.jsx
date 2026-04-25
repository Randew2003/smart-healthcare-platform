import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Doctors", to: "/doctors" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];

const servicesLinks = [
  { label: "Appointments", to: "/appointments" },
  { label: "Telemedicine", to: "/telemedicine" },
  { label: "Payments", to: "/payments" },
  { label: "Medical Records", to: "/profile" },
];

const supportLinks = [
  { label: "Help Center", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Data Protection", to: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="mt-20 font-sans">
      
      {/* 🔹 MAIN FOOTER */}
      <div className="border-t border-[#D8EAF6] bg-[#F6FAFD]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-14 lg:grid-cols-12 lg:px-8">

          {/* BRAND */}
          <div className="lg:col-span-5">
            <img
              src={logo}
              alt="HealthCare"
              className="mb-6 h-[48px] w-auto object-contain"  // 🔥 increased size
            />

            <p className="max-w-md text-sm leading-7 text-slate-600">
              HealthCare helps patients connect with doctors, manage
              appointments, access telemedicine services, and complete secure
              healthcare payments online.
            </p>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>support@healthcare.com</p>
              <p>+94 11 234 5678</p>
              <p>24/7 Patient Support</p>
            </div>
          </div>

          {/* LINKS */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:justify-self-end lg:w-[650px]">

            <div>
              <h3 className="mb-4 text-sm font-semibold text-[#2459A6]">
                Quick Links
              </h3>

              <ul className="space-y-2.5">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-slate-600 transition hover:text-[#1F8DD6]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-[#2459A6]">
                Services
              </h3>

              <ul className="space-y-2.5">
                {servicesLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-slate-600 transition hover:text-[#1F8DD6]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-[#2459A6]">
                Support
              </h3>

              <ul className="space-y-2.5">
                {supportLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-slate-600 transition hover:text-[#1F8DD6]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* 🔹 BOTTOM BAR (FIXED ALIGNMENT) */}
      <div className="border-t border-[#D8EAF6] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-sm text-slate-500 lg:px-8">
          
          {/* LEFT */}
          <p>© 2026 HealthCare. All rights reserved.</p>

          {/* RIGHT (perfect align now) */}
          <p className="text-[#35B85A]">
            Secure care, simple access, better health.
          </p>

        </div>
      </div>

    </footer>
  );
}