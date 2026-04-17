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

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => u?._id === selectedUserId) || null;
  }, [users, selectedUserId]);

  useEffect(() => {
    if (!selectedUser) return;
    setEditForm({
      fullName: selectedUser?.fullName || "",
      email: selectedUser?.email || "",
      phone: selectedUser?.phone || ""
    });
  }, [selectedUser]);

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
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
            <p className="mt-2 text-sm text-slate-600">
              Backed by auth-admin-service: <span className="font-semibold">GET /api/admin/users</span>
            </p>
          </div>
          <button
            onClick={loadUsers}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
          >
            Refresh
          </button>
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

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Doctor status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => {
                  const id = u?._id;
                  const busy = !!actionLoading[id];
                  const isSelf = currentUserId && (currentUserId === id);
                  const isSelected = selectedUserId === id;
                  return (
                    <tr key={id} className={`text-slate-700 ${isSelected ? "bg-blue-50/60" : ""}`}>
                      <td className="px-6 py-4 font-semibold text-slate-900">{u?.fullName}</td>
                      <td className="px-6 py-4">{u?.email}</td>
                      <td className="px-6 py-4">{u?.role}</td>
                      <td className="px-6 py-4">{u?.isActive ? "Yes" : "No"}</td>
                      <td className="px-6 py-4">{u?.doctorVerificationStatus || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedUserId(id)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-slate-300"
                          >
                            View
                          </button>

                          <button
                            disabled={busy}
                            onClick={() => toggleStatus(id)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                              u?.isActive
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && users.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>
                      No users found.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">User Details</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Backend: <span className="font-semibold">GET /api/admin/users</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
                <Detail label="ID" value={selectedUser?._id} mono />
                <Detail label="Role" value={selectedUser?.role} />
                <Detail label="Active" value={selectedUser?.isActive ? "Yes" : "No"} />
                <Detail label="Doctor status" value={selectedUser?.doctorVerificationStatus || "-"} />
                <Detail label="Created" value={formatDateTime(selectedUser?.createdAt)} />
                <Detail label="Updated" value={formatDateTime(selectedUser?.updatedAt)} />
              </div>

              {selectedUser?.role === "doctor" && selectedUser?.doctorApplication && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor Application</div>
                  <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <Detail label="Specialization" value={selectedUser.doctorApplication.specialization || "-"} />
                    <Detail label="License" value={selectedUser.doctorApplication.licenseNumber || "-"} />
                    <Detail label="Clinic" value={selectedUser.doctorApplication.clinicName || "-"} />
                    <Detail label="Experience" value={selectedUser.doctorApplication.yearsExperience || "-"} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Update User</h2>
              <p className="mt-1 text-sm text-slate-600">
                Backend: <span className="font-semibold">PATCH /api/admin/users/:id</span>
              </p>

              <div className="mt-5 grid gap-4">
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
