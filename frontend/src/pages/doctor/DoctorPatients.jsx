import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";
import { normalizeApiPayload, useDoctorServiceId } from "./doctorUtils";
import banner from "../../assets/banner2.png";

function JsonBox({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-black text-slate-900">{title}</div>
      <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        {value ? JSON.stringify(value, null, 2) : "-"}
      </pre>
    </div>
  );
}

export default function DoctorPatients() {
  const { doctorId, setDoctorId, resolving, resolvedFrom } = useDoctorServiceId();

  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [reports, setReports] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  const fetchSection = async (section) => {
    if (!isLoggedIn()) {
      setError("Please login first.");
      return;
    }

    if (!doctorId) {
      setError("Set your doctor service id first.");
      return;
    }

    if (!patientId) {
      setError("Enter a patient id.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(
        `/api/doctors/${encodeURIComponent(doctorId)}/patients/${encodeURIComponent(
          patientId
        )}/${section}`
      );

      const payload = normalizeApiPayload(data);
      const result = payload?.data || payload;

      if (section === "profile") setProfile(result);
      if (section === "medical-history") setHistory(result);
      if (section === "reports") setReports(result);
      if (section === "prescriptions") setPrescriptions(result);

      setMessage("Loaded: " + section);
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to load ${section}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[200px] sm:h-[240px] lg:h-[280px]">
            <img
              src={banner}
              alt="Patient records"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />
            <div className="relative flex h-full items-center p-5 sm:p-8">
              <div className="max-w-2xl">
                <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#00bbb3]">
                  Patient Service
                </div>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Patient Records
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                  View patient profile, history, reports, and prescriptions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Records</h2>
              <p className="mt-1 text-sm text-slate-600">Fetch and review patient data by ID.</p>
            </div>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Login as a verified doctor to view patient records.
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className="text-xs font-extrabold text-slate-700">Doctor Service ID</label>
              <input
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Paste doctor-service doctor _id"
                className={inputClass}
              />
              <div className="mt-2 text-xs text-slate-500">
                {resolvedFrom ? `Resolved from: ${resolvedFrom}` : null}
                {resolving ? " (resolving...)" : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className="text-xs font-extrabold text-slate-700">Patient ID</label>
              <input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Paste patient-service patient id"
                className={inputClass}
              />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {message}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => fetchSection("profile")}
              disabled={loading}
              className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
            >
              Profile
            </button>
            <button
              onClick={() => fetchSection("medical-history")}
              disabled={loading}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14] disabled:opacity-60"
            >
              Medical history
            </button>
            <button
              onClick={() => fetchSection("reports")}
              disabled={loading}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14] disabled:opacity-60"
            >
              Reports
            </button>
            <button
              onClick={() => fetchSection("prescriptions")}
              disabled={loading}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14] disabled:opacity-60"
            >
              Prescriptions
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <JsonBox title="Profile" value={profile} />
            <JsonBox title="Medical history" value={history} />
            <JsonBox title="Reports" value={reports} />
            <JsonBox title="Prescriptions" value={prescriptions} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
