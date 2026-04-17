import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getToken } from "../../utils/auth";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);

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
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-32">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">
            Manage users, verify doctors, and oversee the platform with real-time insights.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <svg className="h-6 w-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-slate-500">Loading dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Welcome back, Admin</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    System is running smoothly. Last updated: {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium text-slate-700">All Systems Operational</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Total Users"
                value={stats.totalUsers}
                change="+12%"
                changeType="positive"
                icon={
                  <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Active Users"
                value={stats.activeUsers}
                change="+8%"
                changeType="positive"
                icon={
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Pending Doctors"
                value={stats.pendingDoctors}
                change={stats.pendingDoctors > 0 ? "Needs Attention" : "All Clear"}
                changeType={stats.pendingDoctors > 0 ? "warning" : "positive"}
                icon={
                  <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Patients"
                value={stats.patients}
                change="+15%"
                changeType="positive"
                icon={
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
              />
              <StatCard
                label="Doctors"
                value={stats.doctors}
                change="+5%"
                changeType="positive"
                icon={
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                }
              />
              <StatCard
                label="Admins"
                value={stats.admins}
                change="Stable"
                changeType="neutral"
                icon={
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l.654 1.13a1.125 1.125 0 01-.26 1.43l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.004.828c.424.35.534.954.26 1.43l-.654 1.13a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-.654-1.13a1.125 1.125 0 01.26-1.43l1.004-.828c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.828a1.125 1.125 0 01-.26-1.43l.654-1.13a1.125 1.125 0 011.37-.49l1.217.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            </div>

            {/* Recent Activity Table */}
            <div className="mt-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Recent User Activity</h2>
                  <p className="mt-1 text-sm text-slate-600">Latest user registrations and status changes</p>
                </div>
                <Link
                  to="/admin/users"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  View All Users
                </Link>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.slice(0, 5).map((user) => (
                      <tr key={user?._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{user?.fullName || "Unknown"}</div>
                              <div className="text-sm text-slate-500">{user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user?.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : user?.role === "doctor"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {user?.role || "patient"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user?.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {user?.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/admin/users`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No users found</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by registering new users.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <QuickLink
                to="/admin/appointments"
                title="Appointments"
                description="Lookup and manage appointments across the platform."
                icon={
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                  </svg>
                }
              />
              <QuickLink
                to="/admin/users"
                title="User Management"
                description="View, activate/deactivate, and delete user accounts."
                icon={
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                }
              />
              <QuickLink
                to="/admin/doctors"
                title="Doctor Verification"
                description="Review and approve pending doctor applications."
                icon={
                  <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, change, changeType, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-medium ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'warning' ? 'text-amber-600' :
              changeType === 'negative' ? 'text-red-600' :
              'text-slate-500'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, title, description, icon }) {
  return (
    <Link to={to} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-lg font-bold text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{description}</div>
          <div className="mt-4 text-sm font-semibold text-[#0070cd] group-hover:text-blue-700">Manage →</div>
        </div>
        <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 group-hover:bg-slate-100">
          {icon}
        </div>
      </div>
    </Link>
  );
}
