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
      <div className="px-4 pb-16 max-w-[1200px] mx-auto">
        <div className="bg-[linear-gradient(135deg,rgba(128,195,66,0.16),rgba(251,176,51,0.14))] border border-[rgba(128,195,66,0.15)] rounded-[18px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <h2 className="m-0 text-2xl text-slate-900">{user?.role === "doctor" ? "My Schedule" : "My Appointments"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {user?.role === "doctor"
              ? "Review your upcoming consultations and manage your schedule."
              : "View and manage your scheduled appointments."}
          </p>
        </div>

        {!isLoggedIn() ? (
          <div className="mt-4 text-slate-600 text-sm">Please login to view your appointments.</div>
        ) : null}

        {error ? <div className="mt-4 rounded-xl bg-red-100 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <div className="mt-4 grid gap-4">
          <div className="bg-white rounded-[18px] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.05)] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
              <h3 className="m-0 text-base font-semibold text-slate-900">
                {user?.role === "doctor" ? "Upcoming Consultations" : "My Appointments"}
              </h3>
              {user?.role !== "doctor" ? (
                <Link
                  to="/book-appointment"
                  className="inline-block rounded-[12px] bg-gradient-to-r from-[#80c342] to-[#fbb033] px-4 py-3 text-sm font-black text-white no-underline"
                >
                  Book New Appointment
                </Link>
              ) : null}
            </div>

            {loading ? <div className="text-slate-600 text-sm">Loading...</div> : null}

            <div className="mt-3 grid gap-2">
              {appointments.map((appt) => (
                <div key={appt._id} className="rounded-[14px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs font-black text-slate-900">
                    <span>{appt.status || "Scheduled"}</span>
                    <span className="font-mono text-[11px] text-slate-500">{appt._id}</span>
                  </div>
                  <div className="mt-2 text-slate-600 text-xs leading-6"><b>Doctor:</b> Dr. {appt.doctor?.name || "N/A"} ({appt.doctor?.specialization || ""})</div>
                  <div className="text-slate-600 text-xs leading-6"><b>Date:</b> {appt.date}</div>
                  <div className="text-slate-600 text-xs leading-6"><b>Time:</b> {appt.time}</div>
                  <div className="text-slate-600 text-xs leading-6"><b>Reason:</b> {appt.notes || "N/A"}</div>
                  <div className="text-slate-600 text-xs leading-6"><b>Created:</b> {appt.createdAt ? new Date(appt.createdAt).toLocaleString() : "-"}</div>
                </div>
              ))}

              {!loading && appointments.length === 0 ? (
                <div className="text-center p-10">
                  <h4 className="m-0 text-lg font-semibold text-slate-900 mb-2">
                    {user?.role === "doctor" ? "No appointments scheduled." : "No Appointments Yet"}
                  </h4>
                  <p className="m-0 text-sm leading-6 text-slate-600">
                    {user?.role === "doctor"
                      ? "You do not have any scheduled consultations yet. Check back later or ask patients to book online."
                      : "You haven't booked any appointments. Start by scheduling your first visit with a doctor."}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

