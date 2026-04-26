import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";
import { normalizeApiPayload, statusBadgeClasses, useDoctorServiceId } from "./doctorUtils";
import banner from "../../assets/patientassets/banner2.png";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString();
}

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
      const appointmentList = Array.isArray(list) ? list : [];

      const patientIds = [...new Set(appointmentList.map((appointment) => appointment?.patientId).filter(Boolean))];
      const patientEntries = await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await api.get(`/api/patients/doctor-view/${encodeURIComponent(patientId)}/profile`);
            return [patientId, response?.data || null];
          } catch {
            return [patientId, null];
          }
        })
      );

      const patientLookup = Object.fromEntries(patientEntries);
      const enrichedAppointments = appointmentList.map((appointment) => ({
        ...appointment,
        patientProfile: patientLookup[appointment?.patientId] || null
      }));

      setAppointments(enrichedAppointments);
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

  const endMeeting = async (appointmentId) => {
    if (!appointmentId) return;

    setActionLoading(appointmentId);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(
        `/api/doctors/${encodeURIComponent(doctorId)}/appointments/${encodeURIComponent(
          appointmentId
        )}/complete`
      );
      setMessage(data?.message || "Meeting ended.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to end meeting.");
    } finally {
      setActionLoading("");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  const appointmentCards = useMemo(() => {
    return appointments.map((appointment) => {
      const patient = appointment?.patientProfile;

      return {
        ...appointment,
        patientName: patient?.fullName || appointment?.patientId || "-",
        patientEmail: patient?.email || "-",
        visitReason: appointment?.notes || "No reason provided",
        appointmentDate: formatDate(appointment?.date)
      };
    });
  }, [appointments]);

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
              <p className="mt-1 text-sm text-slate-600">Accept requests and review patient details for each appointment.</p>
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

            {!loading && appointmentCards.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No appointments yet.
              </div>
            ) : null}

            <div className="grid gap-3">
              {appointmentCards.map((appointment) => (
                <div key={appointment?._id} className="rounded-2xl border border-black/5 bg-[#fbfdf9] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-black text-slate-900">{appointment?.patientName}</div>
                      <div className="mt-1 text-xs text-slate-500">Patient ID: {appointment?.patientId || "-"}</div>
                    </div>
                    <div
                      className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusBadgeClasses(
                        appointment?.status
                      )}`}
                    >
                      {appointment?.status || "pending"}
                    </div>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    {appointment?.appointmentDate} | {appointment?.time || "-"}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Patient Name</div>
                      <div className="mt-2 break-words text-sm font-semibold text-slate-900">{appointment?.patientName}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Patient ID</div>
                      <div className="mt-2 break-words text-sm font-semibold text-slate-900">{appointment?.patientId || "-"}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Patient Email</div>
                      <div className="mt-2 break-words text-sm font-semibold text-slate-900">{appointment?.patientEmail}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2 xl:col-span-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Reason to Visit</div>
                      <div className="mt-2 break-words text-sm font-semibold text-slate-900">{appointment?.visitReason}</div>
                    </div>
                  </div>

                  {appointment?.meetingLink ? (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-extrabold text-[#2f6b14]"
                    >
                      Join live session
                    </a>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {appointment?.status !== "Confirmed" && appointment?.status !== "Completed" ? (
                      <button
                        onClick={() => accept(appointment?._id)}
                        disabled={actionLoading === appointment?._id}
                        className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                      >
                        {actionLoading === appointment?._id ? "Working..." : "Accept"}
                      </button>
                    ) : null}

                    {appointment?.status === "Confirmed" ? (
                      <button
                        onClick={() => endMeeting(appointment?._id)}
                        disabled={actionLoading === appointment?._id}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                      >
                        {actionLoading === appointment?._id ? "Working..." : "End Meeting"}
                      </button>
                    ) : null}
                  </div>

                  {appointment?.status === "Confirmed" ? (
                    <div className="mt-2 text-sm font-semibold text-[#2f6b14]">
                      Status: Meeting ongoing
                    </div>
                  ) : null}

                  {appointment?.status === "Completed" ? (
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      Status: Meeting ended
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
