import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getToken } from "../../utils/auth";
import AOS from "aos";
import "aos/dist/aos.css";
import banner from "../../assets/adminassets/admindashboard-pic (2).png";

function formatCompactDate(dateValue) {
  if (!dateValue) return "Date unavailable";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatRelativeTime(dateValue) {
  if (!dateValue) return "recently";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "recently";

  const diffMinutes = Math.max(1, Math.floor((Date.now() - parsedDate.getTime()) / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatCompactDate(dateValue);
}

function getInitials(fullName) {
  return (fullName || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "U";
}

function getUserBadge(user) {
  if (user?.role === "doctor") {
    if (user?.doctorVerificationStatus === "pending") {
      return {
        label: "Doctor pending",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        tone: "from-amber-500 to-orange-500"
      };
    }

    if (user?.doctorVerificationStatus === "verified") {
      return {
        label: "Doctor verified",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone: "from-emerald-500 to-teal-500"
      };
    }

    return {
      label: "Doctor account",
      className: "border-sky-200 bg-sky-50 text-sky-700",
      tone: "from-sky-500 to-blue-500"
    };
  }

  if (user?.role === "admin") {
    return {
      label: "System admin",
      className: "border-slate-200 bg-slate-100 text-slate-700",
      tone: "from-slate-700 to-slate-900"
    };
  }

  return {
    label: "Patient",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
    tone: "from-indigo-500 to-violet-500"
  };
}

function getUserState(user) {
  if (user?.role === "doctor") {
    if (user?.doctorVerificationStatus === "pending") {
      return {
        label: "Awaiting review",
        className: "border-amber-200 bg-amber-50 text-amber-700"
      };
    }

    if (user?.doctorVerificationStatus === "verified") {
      return {
        label: "Verified",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700"
      };
    }
  }

  if (user?.isActive === false) {
    return {
      label: "Inactive",
      className: "border-slate-200 bg-slate-100 text-slate-600"
    };
  }

  return {
    label: "Active",
    className: "border-blue-200 bg-blue-50 text-blue-700"
  };
}

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

  const recentUsers = useMemo(() => users.slice(0, 5), [users]);
  const recentJoinText = recentUsers.length ? formatRelativeTime(recentUsers[0]?.createdAt) : "no recent logs";
  const activePercentage = stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-slate-900">
        <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]" data-aos="fade-up">
          <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative h-50 sm:h-60 lg:h-70">
            <img
              src={banner}
              alt="Admin dashboard"
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-r from-slate-900/90 via-slate-800/80 to-white/10" />
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
                <div className="mt-6 flex flex-wrap items-center gap-3" data-aos="fade-up" data-aos-delay="300">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]" />
                    Live admin pulse
                  </div>
                  <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur-md">
                    <div className="flex -space-x-2">
                      {recentUsers.slice(0, 3).map((user) => (
                        <div
                          key={user?._id || user?.email}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/15 text-[10px] font-black uppercase text-white"
                          title={user?.fullName || user?.email || "User"}
                        >
                          {getInitials(user?.fullName)}
                        </div>
                      ))}
                    </div>
                    <span>
                      {recentUsers.length ? `${recentUsers.length} recent user logs` : "No user logs yet"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-4xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8" data-aos="fade-up" data-aos-delay="100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Platform Statistics</h2>
              <p className="mt-1 text-sm text-slate-600">Real-time data across all registered services and the newest user registrations.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
            <StatCard label="Total Users" value={loading ? "..." : stats.totalUsers} delay="100" color="bg-gradient-to-br from-blue-50 to-white text-blue-700 border-blue-100" />
            <StatCard label="Active Users" value={loading ? "..." : stats.activeUsers} delay="150" color="bg-gradient-to-br from-emerald-50 to-white text-emerald-700 border-emerald-100" />
            <StatCard label="Pending Doctors" value={loading ? "..." : stats.pendingDoctors} delay="200" color="bg-gradient-to-br from-amber-50 to-white text-amber-700 border-amber-100" />
            <StatCard label="Patients" value={loading ? "..." : stats.patients} delay="250" color="bg-gradient-to-br from-indigo-50 to-white text-indigo-700 border-indigo-100" />
            <StatCard label="Total Doctors" value={loading ? "..." : stats.doctors} delay="300" color="bg-gradient-to-br from-teal-50 to-white text-teal-700 border-teal-100" />
            <StatCard label="System Admins" value={loading ? "..." : stats.admins} delay="350" color="bg-gradient-to-br from-slate-50 to-white text-slate-700 border-slate-200" />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 text-sm text-slate-600">
            Active account ratio: <span className="font-bold text-slate-900">{activePercentage}%</span> of the total user base, with the latest log entry {recentJoinText}.
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.85fr]">
          <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" data-aos="fade-up" data-aos-delay="180">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Recent Logs</div>
                <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Newest user activity</h2>
                <p className="mt-1 text-sm text-slate-600">The latest accounts added to the platform, shown in the same order the admin service returns them.</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                {recentUsers.length} entries
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {recentUsers.length ? (
                recentUsers.map((user, index) => {
                  const badge = getUserBadge(user);
                  const state = getUserState(user);

                  return (
                    <div
                      key={user?._id || user?.email || index}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50/70 p-4 shadow-[0_12px_40px_-26px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_20px_50px_-30px_rgba(37,99,235,0.35)]"
                      data-aos="fade-up"
                      data-aos-delay={String(100 + index * 50)}
                    >
                      <div className={`absolute inset-y-0 left-0 w-1.5 bg-linear-to-b ${badge.tone}`} />
                      <div className="flex flex-col gap-4 pl-3 sm:flex-row sm:items-center">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${badge.tone} text-sm font-black text-white shadow-lg shadow-slate-300/40`}>
                          {getInitials(user?.fullName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="truncate text-lg font-black text-slate-900">{user?.fullName || "Unnamed user"}</div>
                              <div className="truncate text-sm text-slate-500">{user?.email || "No email provided"}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${badge.className}`}>
                                {badge.label}
                              </span>
                              <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${state.className}`}>
                                {state.label}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                            <span className="rounded-full bg-white px-3 py-1 shadow-sm">Joined {formatCompactDate(user?.createdAt)}</span>
                            <span className="rounded-full bg-white px-3 py-1 shadow-sm">{formatRelativeTime(user?.createdAt)}</span>
                            <span className="rounded-full bg-white px-3 py-1 shadow-sm">{user?.phone || "No phone on file"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  No recent user logs available yet.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6" data-aos="fade-up" data-aos-delay="230">
            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.75)]">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-white/60">System Pulse</div>
              <h3 className="mt-3 text-2xl font-black">Healthy and active</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                Keep a close eye on the newest registrations, pending doctor approvals, and active account distribution.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Active ratio</div>
                  <div className="mt-2 text-3xl font-black">{activePercentage}%</div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-linear-to-r from-emerald-400 to-cyan-300" style={{ width: `${activePercentage}%` }} />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Pending doctors</div>
                  <div className="mt-2 text-3xl font-black">{loading ? "..." : stats.pendingDoctors}</div>
                  <div className="mt-2 text-sm text-white/70">Applications waiting for review.</div>
                </div>
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Quick Operations</div>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Admin shortcuts</h3>
              <p className="mt-1 text-sm text-slate-600">Manage directory content and verify applications.</p>

              <div className="mt-6 grid gap-4">
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
          </aside>
        </div>

      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, delay, color }) {
  return (
    <div 
      className={`rounded-3xl border p-5 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_-30px_rgba(15,23,42,0.5)] ${color}`}
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
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_18px_50px_-30px_rgba(37,99,235,0.45)]"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-3xl shadow-inner transition-transform group-hover:scale-105">
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
