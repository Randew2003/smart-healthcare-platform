import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getToken, getUser } from "../../utils/auth";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", phone: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const currentUserId = getUser()?.id || getUser()?._id;

  const headers = useMemo(() => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      if (!token) {
        setError("Admin token missing. Please login again.");
        setUsers([]);
        return;
      }
      const res = await fetch("/api/admin/users", { headers });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load users.");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = !roleFilter || user?.role === roleFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && user?.isActive) ||
        (statusFilter === "inactive" && !user?.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => u?._id === selectedUserId) || null;
  }, [users, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId || !selectedUser) {
      setEditForm({ fullName: "", email: "", phone: "" });
      return;
    }
    setEditForm({
      fullName: selectedUser.fullName || "",
      email: selectedUser.email || "",
      phone: selectedUser.phone || ""
    });
  }, [selectedUserId, selectedUser]);

  const setBusy = (id, busy) => {
    setActionLoading((prev) => ({ ...prev, [id]: busy }));
  };

  const toggleStatus = async (id) => {
    setError("");
    setSuccess("");
    setBusy(id, true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}/toggle-status`, {
        method: "PATCH",
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to toggle user.");

      setUsers((prev) => prev.map((u) => (u?._id === id ? data.user : u)));
    } catch (err) {
      setError(err?.message || "Failed to toggle user.");
    } finally {
      setBusy(id, false);
    }
  };

  const deleteUser = async (id) => {
    setError("");
    setSuccess("");
    setBusy(id, true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete user.");
      setUsers((prev) => prev.filter((u) => u?._id !== id));
      if (selectedUserId === id) {
        setSelectedUserId(null);
      }
    } catch (err) {
      setError(err?.message || "Failed to delete user.");
    } finally {
      setBusy(id, false);
    }
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setError("");
    setSuccess("");
    setEditSaving(true);
    try {
      const payload = {
        fullName: editForm.fullName?.trim(),
        email: editForm.email?.trim(),
        phone: editForm.phone?.trim()
      };

      const res = await fetch(`/api/admin/users/${encodeURIComponent(selectedUser._id)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update user.");

      const updated = data.user;
      if (updated?._id) {
        setUsers((prev) => prev.map((u) => (u?._id === updated._id ? updated : u)));
        setSuccess(data?.message || "User updated successfully.");
      } else {
        setSuccess("User updated successfully.");
        await loadUsers();
      }
    } catch (err) {
      setError(err?.message || "Failed to update user.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-32">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-600">
            Manage user accounts, roles, and permissions across the platform.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* Overview Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Total Users</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{users.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Active Users</p>
                <p className="mt-2 text-2xl font-bold text-green-600">{users.filter(u => u?.isActive).length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Doctors</p>
                <p className="mt-2 text-2xl font-bold text-indigo-600">{users.filter(u => u?.role === 'doctor').length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Admins</p>
                <p className="mt-2 text-2xl font-bold text-red-600">{users.filter(u => u?.role === 'admin').length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l.654 1.13a1.125 1.125 0 01-.26 1.43l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.004.828c.424.35.534.954.26 1.43l-.654 1.13a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-.654-1.13a1.125 1.125 0 01.26-1.43l1.004-.828c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.828a1.125 1.125 0 01-.26-1.43l.654-1.13a1.125 1.125 0 011.37-.49l1.217.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Users</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {filteredUsers.length} of {users.length} users
                </p>
              </div>
              <button
                onClick={loadUsers}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <svg className="mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Search Users</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Roles</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("");
                    setStatusFilter("");
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Doctor Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((u) => {
                  const id = u?._id;
                  const busy = !!actionLoading[id];
                  const isSelf = currentUserId && (currentUserId === id);
                  const isSelected = selectedUserId === id;
                  return (
                    <tr key={id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {u?.fullName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{u?.fullName}</div>
                            <div className="text-sm text-slate-500">{u?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          u?.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : u?.role === "doctor"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {u?.role || "patient"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                          u?.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                            u?.isActive ? "bg-green-500" : "bg-red-500"
                          }`}></span>
                          {u?.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u?.doctorVerificationStatus ? (
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            u.doctorVerificationStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : u.doctorVerificationStatus === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {u.doctorVerificationStatus}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedUserId(id)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <svg className="mr-1 h-3 w-3 inline" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                          </button>

                          <button
                            disabled={busy}
                            onClick={() => toggleStatus(id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              u?.isActive
                                ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            } ${busy ? "cursor-not-allowed opacity-70" : ""}`}
                          >
                            {u?.isActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            disabled={busy || isSelf}
                            onClick={() => deleteUser(id)}
                            className={`rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 ${
                              busy || isSelf ? "cursor-not-allowed opacity-60" : ""
                            }`}
                            title={isSelf ? "You cannot delete your own account." : ""}
                          >
                            <svg className="mr-1 h-3 w-3 inline" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                      <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <h3 className="text-sm font-medium text-slate-900 mb-1">No users found</h3>
                      <p className="text-sm text-slate-500">
                        {users.length === 0 ? "Get started by registering new users." : "Try adjusting your search or filters."}
                      </p>
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                      <div className="flex items-center justify-center">
                        <svg className="h-6 w-6 animate-spin text-slate-400 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>

        {selectedUserId && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">User Details</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage user information and permissions
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* User Info Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {selectedUser?.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-slate-900">{selectedUser?.fullName}</h4>
                      <p className="text-sm text-slate-500">{selectedUser?.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Detail label="User ID" value={selectedUser?._id} mono />
                    <Detail label="Role" value={selectedUser?.role} />
                    <Detail label="Status" value={selectedUser?.isActive ? "Active" : "Inactive"} />
                    <Detail label="Doctor Status" value={selectedUser?.doctorVerificationStatus || "-"} />
                    <Detail label="Created" value={formatDateTime(selectedUser?.createdAt)} />
                    <Detail label="Updated" value={formatDateTime(selectedUser?.updatedAt)} />
                  </div>
                </div>

                {/* Edit Form */}
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Edit User</h4>
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">Full Name</label>
                      <input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">Email</label>
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
                        placeholder="Email"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">Phone</label>
                      <input
                        value={editForm.phone}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
                        placeholder="Phone"
                      />
                    </div>

                    <button
                      onClick={saveUser}
                      disabled={editSaving}
                      className={`rounded-xl bg-[#0070cd] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 ${
                        editSaving ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      {editSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Doctor Application Details */}
              {selectedUser?.role === "doctor" && selectedUser?.doctorApplication && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Doctor Application</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Detail label="Specialization" value={selectedUser.doctorApplication.specialization || "-"} />
                    <Detail label="License Number" value={selectedUser.doctorApplication.licenseNumber || "-"} />
                    <Detail label="Clinic Name" value={selectedUser.doctorApplication.clinicName || "-"} />
                    <Detail label="Years of Experience" value={selectedUser.doctorApplication.yearsExperience || "-"} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function Detail({ label, value, mono = false }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 font-medium text-slate-800 ${mono ? "font-mono text-xs" : ""}`}>{value ?? "-"}</div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}
