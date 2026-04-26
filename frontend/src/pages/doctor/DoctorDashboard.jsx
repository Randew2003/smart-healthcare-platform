import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";
import { normalizeApiPayload, useDoctorServiceId } from "./doctorUtils";
import banner from "../../assets/patientassets/banner2.png";

export default function DoctorDashboard() {
  const user = getUser();
  const { doctorId, setDoctorId, resolving, resolvedFrom } = useDoctorServiceId();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const load = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (!doctorId) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/doctors/${encodeURIComponent(doctorId)}/dashboard`);
      setDashboard(normalizeApiPayload(data));
    } catch (err) {
      setDashboard(null);
      setError(err?.response?.data?.message || "Failed to load doctor dashboard.");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = dashboard?.stats || dashboard?.data?.stats || dashboard?.data?.data?.stats;
  const doctor = dashboard?.doctor || dashboard?.data?.doctor || dashboard?.data?.data?.doctor;

  const statItems = stats
    ? [
        { label: "Total appointments", value: stats.totalAppointments },
        { label: "Pending", value: stats.pendingAppointments },
        { label: "Confirmed", value: stats.confirmedAppointments },
        { label: "Completed", value: stats.completedAppointments },
        { label: "Cancelled", value: stats.cancelledAppointments },
        { label: "Prescriptions", value: stats.totalPrescriptions },
        { label: "Availability slots", value: stats.totalAvailabilitySlots },
        { label: "Booked slots", value: stats.bookedAvailabilitySlots }
      ]
    : [];

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[200px] sm:h-[240px] lg:h-[280px]">
            <img
              src={banner}
              alt="Doctor dashboard"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />
            <div className="relative flex h-full items-center p-5 sm:p-8">
              <div className="max-w-2xl">
                <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#00bbb3]">
                  Doctor Workspace
                </div>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Doctor Dashboard
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                  Overview of appointments, availability, and care activity.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Dashboard details</h2>
              <p className="mt-1 text-sm text-slate-600">Stats and account details for your doctor profile.</p>
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
              Login as a verified doctor to view the dashboard.
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-extrabold text-slate-700">Account</div>
              <div className="mt-2 text-sm text-slate-700">
                <div>
                  <span className="font-extrabold">Auth User ID:</span>{" "}
                  <span className="font-mono text-xs">{user?.id || "-"}</span>
                </div>
                <div className="mt-1">
                  <span className="font-extrabold">Email:</span> {user?.email || "-"}
                </div>
                <div className="mt-1">
                  <span className="font-extrabold">Doctor Service ID:</span>{" "}
                  <span className="font-mono text-xs">{doctorId || "-"}</span>
                </div>
                {resolvedFrom ? (
                  <div className="mt-1 text-xs text-slate-500">Resolved from: {resolvedFrom}</div>
                ) : null}
                {resolving ? (
                  <div className="mt-1 text-xs text-slate-500">Resolving doctor id...</div>
                ) : null}
              </div>

              <div className="mt-4">
                <label className="text-xs font-extrabold text-slate-700">Set doctor service id</label>
                <input
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  placeholder="Paste doctor-service doctor _id"
                  className={inputClass}
                />
                <div className="mt-2 text-xs text-slate-500">
                  Tip: This id must exist in doctor-service (used by /api/doctors/:id/*).
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold text-slate-700">Doctor</div>
                  <div className="mt-2 text-base font-black text-slate-900">
                    {doctor?.name || "-"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-600">
                    {doctor?.specialization || "-"}
                  </div>
                </div>
                {doctor?.verificationStatus ? (
                  <div className="rounded-full border border-[#fbb033]/35 bg-[#fbb033]/15 px-3 py-1 text-xs font-extrabold text-[#7a4d00]">
                    {doctor.verificationStatus}
                  </div>
                ) : null}
              </div>

              {loading ? <div className="mt-4 text-sm text-slate-600">Loading...</div> : null}
              {error ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-base font-black text-slate-900">Stats</h2>

            {!doctorId ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Set your doctor-service id to load dashboard stats.
              </div>
            ) : null}

            {!!doctorId && !loading && !stats ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No dashboard data yet.
              </div>
            ) : null}

            {stats ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-black/5 bg-[#fbfdf9] p-4">
                    <div className="text-xs font-extrabold text-slate-600">{item.label}</div>
                    <div className="mt-2 text-2xl font-black text-slate-900">
                      {typeof item.value === "number" ? item.value : item.value ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
