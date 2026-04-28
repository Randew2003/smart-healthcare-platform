import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";
import { useDoctorServiceId } from "../doctor/doctorUtils";

export default function MyAppointments() {
  const user = getUser();
  const { doctorId, resolving } = useDoctorServiceId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);

  const loadMyAppointments = async () => {
    if (!isLoggedIn()) return;

    setLoading(true);
    setError("");

    try {
      const userId = user?.id || user?._id || "UNKNOWN_USER";

      if (user?.role === "doctor") {
        if (!doctorId) {
          setAppointments([]);
          if (!resolving) {
            setError("Doctor profile not found in doctor-service. Ask admin to verify/sync your doctor profile.");
          }
          return;
        }
      }

      const endpoint = user?.role === "doctor"
        ? `/api/appointments/doctor/${encodeURIComponent(doctorId)}`
        : `/api/appointments/patient/${encodeURIComponent(userId)}`;

      const { data } = await api.get(endpoint);
      
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyAppointments();
  }, [doctorId, resolving]);

  return (
    <MainLayout>
      <section className="min-h-screen bg-[#F6FAFD] px-6 py-8 text-slate-800 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-[#D8EAF6] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#35B85A]">
                    {user?.role === "doctor" ? "Schedule" : "Appointments"}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-[#2459A6]">
                    {user?.role === "doctor" ? "My Schedule" : "My Appointments"}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {user?.role === "doctor"
                      ? "Review your upcoming consultations and manage your schedule."
                      : "View and manage your scheduled appointments."}
                  </p>
                </div>
                {user?.role !== "doctor" ? (
                  <Link
                    to="/book-appointment"
                    className="rounded-lg bg-[#2459A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4a8a] no-underline whitespace-nowrap"
                  >
                    Book New Appointment
                  </Link>
                ) : null}
              </div>
            </div>

            {!isLoggedIn() && (
              <div className="mt-5 rounded-xl border border-[#D8EAF6] bg-white p-4 text-sm text-slate-600">
                Please login to view your appointments.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="mt-5">
              {loading ? (
                <div className="rounded-xl border border-[#D8EAF6] bg-white p-8 text-center text-sm text-slate-500">
                  Loading appointments...
                </div>
              ) : appointments.length === 0 ? (
                <div className="rounded-xl border border-[#D8EAF6] bg-white p-8 text-center">
                  <h2 className="text-lg font-bold text-[#2459A6]">
                    {user?.role === "doctor" ? "No appointments scheduled." : "No Appointments Yet"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {user?.role === "doctor"
                      ? "You do not have any scheduled consultations yet. Check back later or ask patients to book online."
                      : "You haven't booked any appointments. Start by scheduling your first visit with a doctor."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                {appointments.map((appt) => (
                  <article key={appt._id} className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#35B85A]">
                          {appt.status || "Scheduled"}
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-[#2459A6]">
                          Dr. {appt.doctor?.name || "N/A"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {appt.doctor?.specialization || ""} • {appt.date ? new Date(appt.date).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      {user?.role !== "doctor" && appt?.status === "Confirmed" && appt?.meetingLink ? (
                        <a
                          href={appt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-[#2459A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4a8a]"
                        >
                          Join Meeting
                        </a>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-bold text-slate-800">Appointment Details</p>
                      <div className="mt-2 space-y-2">
                        <div className="rounded-lg bg-[#F6FAFD] px-3 py-2">
                          <p className="text-xs text-slate-500">Time</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {appt.time ? new Date(`2000-01-01T${appt.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                          </p>
                        </div>
                        {appt.notes && (
                          <div className="rounded-lg bg-[#F6FAFD] px-3 py-2">
                            <p className="text-xs text-slate-500">Reason for Visit</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{appt.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

