import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getToken } from "../../utils/auth";

export default function PendingDoctors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [busy, setBusy] = useState({});

  const getHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const loadPending = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("Admin token missing. Please login again.");
        setDoctors([]);
        return;
      }

      const res = await fetch("/api/admin/doctors/pending", { headers: getHeaders() });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load pending doctors.");
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load pending doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const setDoctorBusy = (id, value) => {
    setBusy((prev) => ({ ...prev, [id]: value }));
  };

  const verify = async (id, status) => {
    setError("");
    setDoctorBusy(id, true);
    try {
      const res = await fetch(`/api/admin/doctors/${encodeURIComponent(id)}/verify`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update doctor status.");
      setDoctors((prev) => prev.filter((d) => d?._id !== id));
    } catch (err) {
      setError(err?.message || "Failed to update doctor status.");
    } finally {
      setDoctorBusy(id, false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-32">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Doctor Verification</h1>
          <p className="text-sm text-slate-600">
            Review and approve doctor applications for the healthcare platform.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Overview Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Pending Applications</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">{doctors.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Specializations</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {new Set(doctors.map(d => d?.doctorApplication?.specialization).filter(Boolean)).size}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Avg Experience</p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {doctors.length > 0
                    ? Math.round(doctors.reduce((sum, d) => sum + (parseInt(d?.doctorApplication?.yearsExperience) || 0), 0) / doctors.length)
                    : 0
                  } yrs
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Clinics</p>
                <p className="mt-2 text-2xl font-bold text-purple-600">
                  {new Set(doctors.map(d => d?.doctorApplication?.clinicName).filter(Boolean)).size}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18l5 3 5-3m-5 3v12.75M6.75 8.25h.008v.008H6.75V8.25z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pending Applications</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review doctor credentials and approve qualified medical professionals
              </p>
            </div>
            <button
              onClick={loadPending}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <svg className="mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <svg className="h-6 w-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-slate-500">Loading applications...</span>
              </div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No pending applications</h3>
              <p className="text-sm text-slate-500">All doctor applications have been reviewed.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {doctors.map((d) => {
                const id = d?._id;
                const isBusy = !!busy[id];
                const application = d?.doctorApplication || {};
                return (
                  <div key={id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-4">
                          <span className="text-xl font-bold text-white">
                            {d?.fullName?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{d?.fullName}</h3>
                          <p className="text-sm text-slate-600">{d?.email}</p>
                          <p className="text-sm text-slate-500">{d?.phone || "No phone provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          <svg className="mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pending Review
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                      <Detail label="Specialization" value={application.specialization || "-"} />
                      <Detail label="License Number" value={application.licenseNumber || "-"} />
                      <Detail label="Clinic Name" value={application.clinicName || "-"} />
                      <Detail label="Years of Experience" value={application.yearsExperience ? `${application.yearsExperience} years` : "-"} />
                      <Detail label="ID Proof" value={application.idProofFileName || "-"} />
                      <Detail label="Medical Certificate" value={application.medicalCertificateFileName || "-"} />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="text-sm text-slate-500">
                        Application submitted {d?.createdAt ? new Date(d.createdAt).toLocaleDateString() : "recently"}
                      </div>

                      <div className="flex space-x-3">
                        <button
                          disabled={isBusy}
                          onClick={() => verify(id, "rejected")}
                          className={`flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 ${
                            isBusy ? "cursor-not-allowed opacity-70" : ""
                          }`}
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {isBusy ? "Processing..." : "Reject"}
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => verify(id, "verified")}
                          className={`flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 ${
                            isBusy ? "cursor-not-allowed opacity-70" : ""
                          }`}
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {isBusy ? "Processing..." : "Approve"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <div className="font-medium text-slate-800">{value}</div>
    </div>
  );
}
