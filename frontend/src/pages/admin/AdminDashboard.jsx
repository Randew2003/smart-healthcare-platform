import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getToken } from "../../utils/auth";
import AOS from "aos";
import "aos/dist/aos.css";
import banner from "../../assets/adminassets/admindashboard-pic (2).png";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-out-quart",
      once: true,
      offset: 50
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const token = getToken();
        if (!token) {
          setError("Admin token missing. Please login again.");
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        };

        const [usersRes, pendingRes] = await Promise.all([
          fetch("/api/admin/users", { headers, signal: controller.signal }),
          fetch("/api/admin/doctors/pending", { headers, signal: controller.signal })
        ]);

        const usersData = await usersRes.json().catch(() => []);
        const pendingData = await pendingRes.json().catch(() => []);

        if (!usersRes.ok) {
          throw new Error(usersData?.message || "Failed to load users.");
        }
        if (!pendingRes.ok) {
          throw new Error(pendingData?.message || "Failed to load pending doctors.");
        }

        setUsers(Array.isArray(usersData) ? usersData : []);
        setPendingDoctors(Array.isArray(pendingData) ? pendingData : []);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u?.isActive).length;
    const admins = users.filter((u) => u?.role === "admin").length;
    const doctors = users.filter((u) => u?.role === "doctor").length;
    const patients = users.filter((u) => u?.role === "patient").length;
    return {
      totalUsers,
      activeUsers,
      admins,
      doctors,
      patients,
      pendingDoctors: pendingDoctors.length
    };
  }, [users, pendingDoctors]);

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-slate-900">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm" data-aos="fade-up">
          <div className="relative h-[200px] sm:h-[240px] lg:h-[280px]">
            <img
              src={banner}
              alt="Admin dashboard"
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-white/10" />
            <div className="relative flex h-full items-center p-6 sm:p-10">
              <div className="max-w-2xl">
                <div 
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-sm backdrop-blur-md"
                  data-aos="fade-down"
                  data-aos-delay="150"
                >
                  Admin Workspace
                </div>
                <h1 
                  className="mt-4 text-3xl font-extrabold text-white sm:text-4xl"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Systems Control Dashboard
                </h1>
                <p 
                  className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base"
                  data-aos="fade-up"
                  data-aos-delay="250"
                >
                  Central overview of platform activity, user management, and pending verification requests.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" data-aos="fade-up" data-aos-delay="100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Platform Statistics</h2>
              <p className="mt-1 text-sm text-slate-600">Real-time data across all registered services.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Refresh Data
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 shadow-sm" data-aos="fade-in">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Users" value={loading ? "..." : stats.totalUsers} delay="100" color="bg-blue-50 text-blue-700 border-blue-100" />
            <StatCard label="Active Users" value={loading ? "..." : stats.activeUsers} delay="150" color="bg-emerald-50 text-emerald-700 border-emerald-100" />
            <StatCard label="Pending Doctors" value={loading ? "..." : stats.pendingDoctors} delay="200" color="bg-amber-50 text-amber-700 border-amber-100" />
            <StatCard label="Patients" value={loading ? "..." : stats.patients} delay="250" color="bg-indigo-50 text-indigo-700 border-indigo-100" />
            <StatCard label="Total Doctors" value={loading ? "..." : stats.doctors} delay="300" color="bg-teal-50 text-teal-700 border-teal-100" />
            <StatCard label="System Admins" value={loading ? "..." : stats.admins} delay="350" color="bg-slate-50 text-slate-700 border-slate-200" />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" data-aos="fade-up" data-aos-delay="200">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Quick Operations</h2>
            <p className="mt-1 text-sm text-slate-600">Manage directory content and verify applications.</p>
          </div>
          
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <QuickLink
              to="/admin/appointments"
              title="Appointments"
              description="Lookup specific appointments by patient or doctor IDs across the network."
              icon="appointments"
              delay="100"
            />
            <QuickLink
              to="/admin/users"
              title="User Directory"
              description="Manage all users, review profiles, toggle system access, or delete records."
              icon="users"
              delay="150"
            />
            <QuickLink
              to="/admin/doctors"
              title="Doctor Verification"
              description="Review and verify or reject newly registered doctor profiles."
              icon="doctors"
              delay="200"
            />
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, delay, color }) {
  return (
    <div 
      className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${color}`}
      data-aos="zoom-in"
      data-aos-delay={delay}
    >
      <div className="text-xs font-extrabold uppercase tracking-[0.2em] opacity-80">{label}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}

function QuickLink({ to, title, description, icon, delay }) {
  const iconEmoji = {
    appointments: "📅",
    users: "👥",
    doctors: "👨‍⚕️"
  };

  return (
    <Link 
      to={to} 
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="mb-4 text-3xl opacity-80 transition-opacity group-hover:opacity-100">
        {iconEmoji[icon] || "📄"}
      </div>
      <div className="text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-700">
        {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </div>
      <div className="mt-6 flex items-center text-sm font-bold text-blue-600 transition-colors group-hover:text-blue-800">
        Open Module <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
      </div>
    </Link>
  );
}
