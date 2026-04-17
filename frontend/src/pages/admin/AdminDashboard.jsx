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
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">
            Overview powered by auth-admin-service admin endpoints.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total users" value={loading ? "…" : stats.totalUsers} />
          <StatCard label="Active users" value={loading ? "…" : stats.activeUsers} />
          <StatCard label="Pending doctors" value={loading ? "…" : stats.pendingDoctors} />
          <StatCard label="Patients" value={loading ? "…" : stats.patients} />
          <StatCard label="Doctors" value={loading ? "…" : stats.doctors} />
          <StatCard label="Admins" value={loading ? "…" : stats.admins} />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <QuickLink
            to="/admin/appointments"
            title="Appointments"
            description="Lookup appointments by patientId or doctorId via appointment-service."
          />
          <QuickLink
            to="/admin/users"
            title="Users"
            description="Manage users via /api/admin/users (toggle status, delete)."
          />
          <QuickLink
            to="/admin/doctors"
            title="Pending Doctors"
            description="Verify/reject doctors via /api/admin/doctors/pending + verify endpoint."
          />
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({ to, title, description }) {
  return (
    <Link to={to} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300">
      <div className="text-base font-bold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-600">{description}</div>
      <div className="mt-4 text-sm font-semibold text-[#0070cd]">Open</div>
    </Link>
  );
}
