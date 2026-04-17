import { useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";

export default function AdminAppointments() {
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);

  const hasResults = appointments.length > 0;

  const fetchAppointments = async (type) => {
    setError("");
    setAppointments([]);

    const id = type === "patient" ? patientId.trim() : doctorId.trim();
    if (!id) {
      setError(`Please enter a ${type}Id.`);
      return;
    }

    setLoading(true);
    try {
      const url = type === "patient"
        ? `/api/appointments/patient/${encodeURIComponent(id)}`
        : `/api/appointments/doctor/${encodeURIComponent(id)}`;

      const res = await fetch(url);
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load appointments.");
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    return appointments.map((a) => {
      const dateValue = a?.date ? new Date(a.date) : null;
      return {
        id: a?._id,
        patientId: a?.patientId,
        doctorId: a?.doctorId,
        date: dateValue && !Number.isNaN(dateValue.getTime()) ? dateValue.toLocaleDateString() : "-",
        time: a?.time || "-",
        status: a?.status || "-",
        meetingLink: a?.meetingLink || ""
      };
    });
  }, [appointments]);

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-32">
        <h1 className="text-2xl font-bold text-slate-900">Admin Appointments</h1>
        <p className="mt-2 text-sm text-slate-600">
          This page uses appointment-service endpoints: <span className="font-semibold">GET /api/appointments/patient/:patientId</span> and <span className="font-semibold">GET /api/appointments/doctor/:doctorId</span>.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Patient ID</label>
            <input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="e.g. 66f..."
            />
            <button
              onClick={() => fetchAppointments("patient")}
              disabled={loading}
              className={`mt-3 w-full rounded-xl bg-[#0070cd] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 ${
                loading ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {loading ? "Loading..." : "Search by Patient"}
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Doctor ID</label>
            <input
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="e.g. 66f..."
            />
            <button
              onClick={() => fetchAppointments("doctor")}
              disabled={loading}
              className={`mt-3 w-full rounded-xl bg-[#0070cd] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 ${
                loading ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {loading ? "Loading..." : "Search by Doctor"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-6 py-3">Appointment</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Meeting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <tr key={r.id || `${r.patientId}-${r.doctorId}-${r.time}`}
                    className="text-slate-700">
                    <td className="px-6 py-4 font-mono text-xs text-slate-800">{r.id || "-"}</td>
                    <td className="px-6 py-4 font-mono text-xs">{r.patientId}</td>
                    <td className="px-6 py-4 font-mono text-xs">{r.doctorId}</td>
                    <td className="px-6 py-4">{r.date}</td>
                    <td className="px-6 py-4">{r.time}</td>
                    <td className="px-6 py-4">{r.status}</td>
                    <td className="px-6 py-4">
                      {r.meetingLink ? (
                        <a className="font-semibold text-[#0070cd] hover:underline" href={r.meetingLink} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}

                {!loading && !error && !hasResults && (
                  <tr>
                    <td className="px-6 py-8 text-center text-slate-500" colSpan={7}>
                      Enter a patientId or doctorId to search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
