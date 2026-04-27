import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getToken, getUser } from "../../utils/auth";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", phone: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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
    AOS.init({
      duration: 900,
      easing: "ease-out-quart",
      once: true,
      offset: 50
    });
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => u?._id === selectedUserId) || null;
  }, [users, selectedUserId]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === "all" ? true : u?.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

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
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        {/* Header Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white shadow-xl shadow-blue-900/20" data-aos="fade-down">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">Admin Users Management</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-blue-100 sm:text-base leading-relaxed">
                Complete control center for platform participants. Review accounts, modify details, and manage system access privileges via the central auth-admin directory.
              </p>
            </div>
            <button
              onClick={loadUsers}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 border border-white/20"
            >
              <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Directory
            </button>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
          <img src="/adminassets/admindashboard-pic (2).png" alt="Users Background" className="absolute right-0 top-0 h-full opacity-10 object-cover mix-blend-overlay" />
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm px-6 py-5 flex items-center gap-4 text-sm font-medium text-red-700 shadow-lg shadow-red-500/10" data-aos="fade-in">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 backdrop-blur-sm px-6 py-5 flex items-center gap-4 text-sm font-medium text-emerald-700 shadow-lg shadow-emerald-500/10" data-aos="fade-in">
             <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 flex flex-col h-[700px]" data-aos="fade-up" data-aos-delay="100">
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">User Directory</h2>
              <div className="ml-3 hidden sm:flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm border border-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{filteredUsers.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto overflow-x-auto">
              <div className="relative w-full min-w-[200px] sm:w-[280px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 shadow-sm"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-shrink-0 appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
              >
                <option value="all">All Roles</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full min-w-full text-left text-sm whitespace-nowrap relative">
              <thead className="sticky top-0 z-10 bg-[#f8fbff] text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500 border-b border-slate-200 shadow-sm">
                <tr>
                  <th className="px-6 sm:px-8 py-5">Account Details</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">System Status</th>
                  <th className="px-6 py-5">Doctor Verification</th>
                  <th className="px-6 sm:px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white">
                {filteredUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-32 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-slate-400">
                        <svg className="mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-lg font-bold text-slate-700">No users found</p>
                        <p className="mt-1 text-sm text-slate-500">The current filter criteria matched no users.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-32 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-r-2 border-blue-600"></div>
                        <span className="font-medium animate-pulse">Syncing user directory...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredUsers.map((u, index) => {
                  const id = u?._id;
                  const busy = !!actionLoading[id];
                  const isSelf = currentUserId && (currentUserId === id);
                  const isSelected = selectedUserId === id;
                  return (
                    <tr 
                      key={id} 
                      className={`text-slate-700 transition-all hover:bg-slate-50/60 ${isSelected ? "bg-blue-50/50" : ""}`}
                    >
                      <td className="px-6 sm:px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner ${
                             u?.role === 'admin' ? "from-purple-100 to-fuchsia-100 text-purple-700 border-purple-200" :
                             u?.role === 'doctor' ? "from-blue-100 to-indigo-100 text-blue-700 border-blue-200" :
                             "from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200"
                          } border font-bold uppercase`}>
                            {u?.fullName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-700 transition-colors">
                              {u?.fullName || "Unnamed User"}
                              {isSelf && <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">You</span>}
                            </div>
                            <div className="text-slate-500 text-sm mt-0.5 font-medium">{u?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-sm border ${
                          u?.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          u?.role === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {u?.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`relative flex h-3 w-3 items-center justify-center`}>
                            {u?.isActive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${u?.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`}></span>
                          </div>
                          <span className="font-bold text-slate-700">{u?.isActive ? "Active" : "Suspended"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {u?.role === "doctor" ? (
                          <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-sm border ${
                            u?.doctorVerificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            u?.doctorVerificationStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            u?.doctorVerificationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {u?.doctorVerificationStatus || "None"}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 sm:px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setSelectedUserId(isSelected ? null : id)}
                            className={`flex items-center justify-center rounded-xl border px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                              isSelected 
                                ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 focus:ring-4 focus:ring-slate-200" 
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:ring-4 focus:ring-slate-100"
                            }`}
                          >
                            {isSelected ? "Close Details" : "Manage User"}
                          </button>

                          <button
                            disabled={busy || isSelf}
                            onClick={() => toggleStatus(id)}
                            title={isSelf ? "Cannot suspend own account" : `Toggle ${u?.fullName}'s status`}
                            className={`flex items-center justify-center h-8 w-8 rounded-xl border transition-all shadow-sm ${
                              u?.isActive
                                ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                            } ${busy || isSelf ? "cursor-not-allowed opacity-50 grayscale" : ""}`}
                          >
                            {u?.isActive ? (
                               <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                               <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                          </button>

                          <button
                            disabled={busy || isSelf}
                            onClick={() => {
                               if(window.confirm(`Are you absolutely sure you want to delete ${u?.fullName}? This cannot be undone.`)){
                                   deleteUser(id);
                               }
                            }}
                            className={`flex items-center justify-center h-8 w-8 rounded-xl border border-red-200 bg-white text-red-500 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-700 ${
                              busy || isSelf ? "cursor-not-allowed opacity-50 grayscale" : ""
                            }`}
                            title={isSelf ? "You cannot delete your own admin account." : "Permanently delete user"}
                          >
                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 pt-[5%] backdrop-blur-sm sm:p-6" data-aos="fade-in">
            <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/50 ring-1 ring-slate-900/10">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-white/90 px-8 py-5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-xl text-blue-600">
                    {selectedUser?.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Manage User Account</h2>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">{selectedUser?.role} level privilege</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Body Container (Scrollable) */}
              <div className="grid gap-0 overflow-y-auto lg:grid-cols-[1fr_1.2fr]">
                {/* Left Side: System Details */}
                <div className="flex flex-col border-b border-slate-100 lg:border-b-0 lg:border-r bg-slate-50/50 p-8">
                  <div className="grid gap-4 rounded-2xl bg-white border border-slate-100 p-6 text-sm text-slate-700 sm:grid-cols-2 shadow-sm">
                    <Detail label="System ID" value={selectedUser?._id} mono />
                    <Detail label="Account Status" value={selectedUser?.isActive ? "Active Verified" : "Suspended Hold"} />
                    <Detail label="Doctor Approval" value={selectedUser?.doctorVerificationStatus || "Not Applicable"} />
                    <Detail label="Created On" value={formatDateTime(selectedUser?.createdAt)} />
                    <Detail label="Last Modified" value={formatDateTime(selectedUser?.updatedAt)} />
                  </div>

                  {selectedUser?.role === "doctor" && selectedUser?.doctorApplication && (
                    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 relative overflow-hidden shadow-sm">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-blue-100/50 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
                      <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-blue-800">Physician Metadata</h3>
                      <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2 relative z-10">
                        <Detail label="Specialty Focus" value={selectedUser.doctorApplication.specialization || "-"} />
                        <Detail label="Medical License" value={selectedUser.doctorApplication.licenseNumber || "-"} />
                        <Detail label="Primary Clinic" value={selectedUser.doctorApplication.clinicName || "-"} />
                        <Detail label="Clinical Tenure" value={selectedUser.doctorApplication.yearsExperience ? `${selectedUser.doctorApplication.yearsExperience} Years` : "-"} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Form Configuration */}
                <div className="flex flex-col bg-white p-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Configuration Panel</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">Modify personal details and contact properties.</p>
                  </div>

                  <div className="mt-6 flex flex-col gap-5 flex-grow">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Full Name</label>
                      <input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        placeholder="Enter user's full name"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        placeholder="Enter contact email address"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Phone Number</label>
                      <input
                        value={editForm.phone}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        placeholder="Enter valid phone number"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => setSelectedUserId(null)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveUser}
                      disabled={editSaving}
                      className={`flex-[2] rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95 ${
                        editSaving ? "cursor-wait opacity-80" : ""
                      }`}
                    >
                      {editSaving ? "Committing Changes..." : "Save Directory Record"}
                    </button>
                  </div>
                </div>
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
