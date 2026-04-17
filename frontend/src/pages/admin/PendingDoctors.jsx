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
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pending Doctors</h1>
            <p className="mt-2 text-sm text-slate-600">
              Backed by auth-admin-service: <span className="font-semibold">GET /api/admin/doctors/pending</span> and <span className="font-semibold">PATCH /api/admin/doctors/:id/verify</span>
            </p>
          </div>
          <button
            onClick={loadPending}
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

        <div className="mt-8 grid gap-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Loading...</div>
          ) : doctors.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">No pending doctors.</div>
          ) : (
            doctors.map((d) => {
              const id = d?._id;
              const isBusy = !!busy[id];
              const application = d?.doctorApplication || {};
              return (
                <div key={id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{d?.fullName}</div>
                      <div className="mt-1 text-sm text-slate-600">{d?.email}</div>
                      <div className="mt-1 text-sm text-slate-600">Phone: {d?.phone || "-"}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={isBusy}
                        onClick={() => verify(id, "verified")}
                        className={`rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 ${
                          isBusy ? "cursor-not-allowed opacity-70" : ""
                        }`}
                      >
                        Verify
                      </button>
                      <button
                        disabled={isBusy}
                        onClick={() => verify(id, "rejected")}
                        className={`rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 ${
                          isBusy ? "cursor-not-allowed opacity-70" : ""
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                    <Detail label="Specialization" value={application.specialization || "-"} />
                    <Detail label="License" value={application.licenseNumber || "-"} />
                    <Detail label="Clinic" value={application.clinicName || "-"} />
                    <Detail label="Experience" value={application.yearsExperience || "-"} />
                    <Detail label="ID proof" value={application.idProofFileName || "-"} />
                    <Detail label="Certificate" value={application.medicalCertificateFileName || "-"} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-800">{value}</div>
    </div>
  );
}
