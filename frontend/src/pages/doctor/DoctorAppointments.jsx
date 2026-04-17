import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";
import { normalizeApiPayload, statusBadgeClasses, useDoctorServiceId } from "./doctorUtils";
import banner from "../../assets/banner2.png";

export default function DoctorAppointments() {
  const { doctorId, setDoctorId, resolving, resolvedFrom } = useDoctorServiceId();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [appointments, setAppointments] = useState([]);

  const load = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (!doctorId) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(`/api/doctors/${encodeURIComponent(doctorId)}/appointments`);
      const payload = normalizeApiPayload(data);
      const list = payload?.data || payload;
      setAppointments(Array.isArray(list) ? list : []);
    } catch (err) {
      setAppointments([]);
      setError(err?.response?.data?.message || "Failed to load doctor appointments.");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  const accept = async (appointmentId) => {
    if (!appointmentId) return;

    setActionLoading(appointmentId);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(
        `/api/doctors/${encodeURIComponent(doctorId)}/appointments/${encodeURIComponent(
          appointmentId
        )}/accept`
      );
      setMessage(data?.message || "Appointment accepted.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to accept appointment.");
    } finally {
      setActionLoading("");
    }
  };

  const reject = async (appointmentId) => {
    if (!appointmentId) return;

    setActionLoading(appointmentId);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(
        `/api/doctors/${encodeURIComponent(doctorId)}/appointments/${encodeURIComponent(
          appointmentId
        )}/reject`
      );
      setMessage(data?.message || "Appointment rejected.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject appointment.");
    } finally {
      setActionLoading("");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[200px] sm:h-[240px] lg:h-[280px]">
            <img
              src={banner}
              alt="Doctor appointments"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />
            <div className="relative flex h-full items-center p-5 sm:p-8">
              <div className="max-w-2xl">
                <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#00bbb3]">
                  Appointment Service
                </div>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Doctor Appointments
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                  Review and confirm appointment requests.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Appointments</h2>
              <p className="mt-1 text-sm text-slate-600">Accept or reject requests and join live sessions.</p>
            </div>

            <button
              onClick={load}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14]"
            >
              Refresh
            </button>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Login as a verified doctor to manage appointments.
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
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

          <div className="mt-6">
            {loading ? <div className="text-sm text-slate-600">Loading appointments...</div> : null}

            {!loading && appointments.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No appointments yet.
              </div>
            ) : null}

            <div className="grid gap-3">
              {appointments.map((a) => (
                <div key={a?._id} className="rounded-2xl border border-black/5 bg-[#fbfdf9] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="text-sm font-black text-slate-900">
                      Patient: {a?.patientId || "-"}
                    </div>
                    <div
                      className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusBadgeClasses(
                        a?.status
                      )}`}
                    >
                      {a?.status || "pending"}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-600">
                    {a?.date ? new Date(a.date).toLocaleDateString() : "-"} • {a?.time || "-"}
                  </div>

                  {a?.meetingLink ? (
                    <a
                      href={a.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-extrabold text-[#2f6b14]"
                    >
                      Join live session
                    </a>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => accept(a?._id)}
                      disabled={actionLoading === a?._id}
                      className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                    >
                      {actionLoading === a?._id ? "Working..." : "Accept"}
                    </button>
                    <button
                      onClick={() => reject(a?._id)}
                      disabled={actionLoading === a?._id}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 disabled:opacity-60"
                    >
                      {actionLoading === a?._id ? "Working..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
