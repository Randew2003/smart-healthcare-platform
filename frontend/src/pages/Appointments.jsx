import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { api } from "../utils/api";
import { getUser, isLoggedIn } from "../utils/auth";
import { submitPayHereCheckout } from "../utils/payhereCheckout";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function statusClasses(status) {
  const s = String(status || "").toLowerCase();

  if (s.includes("cancel")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (s.includes("complete") || s.includes("done") || s.includes("success")) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (s.includes("confirm") || s.includes("approved")) {
    return "border-[#fbb033]/35 bg-[#fbb033]/10 text-[#7a4d00]";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function Appointments() {
  const navigate = useNavigate();
  const query = useQuery();
  const preselectDoctorId = query.get("doctorId") || "";

  const user = getUser();
  const role = user?.role;
  const isPatient = role === "patient";
  const isDoctor = role === "doctor";

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(preselectDoctorId);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [amount, setAmount] = useState(1500);

  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const userId = user?.id || "";

  const canBook = isPatient && !!doctorId && !!date && !!time && isLoggedIn();

  const loadDoctors = useCallback(async () => {
    if (!isPatient) {
      setDoctors([]);
      setLoadingDoctors(false);
      return;
    }

    setLoadingDoctors(true);

    try {
      const { data } = await api.get("/api/doctors/verified");
      const list = Array.isArray(data) ? data : data?.data;
      setDoctors(Array.isArray(list) ? list : []);
    } catch {
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  }, [isPatient]);

  const loadMyAppointments = useCallback(async () => {
    if (!isLoggedIn() || !userId) return;

    setLoadingAppointments(true);
    try {
      const path = isDoctor
        ? `/api/appointments/doctor/${encodeURIComponent(userId)}`
        : `/api/appointments/patient/${encodeURIComponent(userId)}`;
      const { data } = await api.get(path);
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, [isDoctor, userId]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    loadMyAppointments();
  }, [loadMyAppointments]);

  const createAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isPatient) {
      setError("Only patients can book appointments.");
      return;
    }

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    if (!user?.id) {
      setError("Missing user id. Please login again.");
      return;
    }

    setBooking(true);
    try {
      const { data } = await api.post("/api/appointments", {
        patientId: user.id,
        doctorId,
        date,
        time
      });

      setMessage(data?.message || "Appointment created.");
      await loadMyAppointments();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create appointment.");
    } finally {
      setBooking(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!id) return;
    if (!isPatient) return;

    try {
      await api.delete(`/api/appointments/${encodeURIComponent(id)}`);
      await loadMyAppointments();
    } catch {
      // ignore
    }
  };

  const payForAppointment = async (appointment) => {
    setError("");
    setMessage("");

    if (!isPatient) {
      setError("Only patients can make payments.");
      return;
    }

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    try {
      const { data } = await api.post("/api/payments", {
        appointmentId: appointment?._id,
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        amount
      });

      submitPayHereCheckout(data?.payhere);
    } catch (err) {
      setError(err?.response?.data?.message || "Payment creation failed.");
    }
  };

  const doctorNameById = useMemo(() => {
    const map = new Map();
    doctors.forEach((d) => map.set(d._id, d.name || d.fullName));
    return (id) => map.get(id) || id;
  }, [doctors]);

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-[170px]">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Appointments</h1>
              <p className="mt-1 text-sm text-slate-600">
                Book appointments and manage your schedule.
              </p>
              {!isLoggedIn() ? (
                <p className="mt-2 text-sm text-slate-600">
                  Please{" "}
                  <Link to="/login" className="font-extrabold text-[#2f6b14]">
                    login
                  </Link>{" "}
                  to book and pay.
                </p>
              ) : null}
            </div>

            <button
              onClick={loadMyAppointments}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14]"
            >
              Refresh
            </button>
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

          <div
            className={`mt-6 grid gap-6 ${isPatient ? "lg:grid-cols-2" : "grid-cols-1"}`}
          >
            {isPatient ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-black text-slate-900">Book an appointment</h2>
                  <Link
                    to="/doctors"
                    className="text-xs font-extrabold text-[#2f6b14]"
                  >
                    View doctors
                  </Link>
                </div>

                <form onSubmit={createAppointment} className="mt-4 grid gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Doctor</label>
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      className={inputClass}
                      disabled={loadingDoctors}
                    >
                      <option value="">
                        {loadingDoctors ? "Loading doctors..." : "Select a doctor"}
                      </option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {(d.name || d.fullName || "Doctor") +
                            " — " +
                            (d.specialization || "General")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-extrabold text-slate-700">Date</label>
                      <input
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        type="date"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-extrabold text-slate-700">Time</label>
                      <input
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        type="time"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-extrabold text-slate-700">Amount (LKR)</label>
                      <input
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value || 0))}
                        type="number"
                        min={1}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        disabled={booking || !canBook}
                        className="w-full rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                        type="submit"
                      >
                        {booking ? "Booking..." : "Book"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Tip: After booking, click <span className="font-bold">Pay with PayHere</span> in your appointment.
                  </p>
                </form>
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-black text-slate-900">
                  {isDoctor ? "My schedule" : "My appointments"}
                </h2>
                {loadingAppointments ? (
                  <div className="text-xs font-semibold text-slate-500">Loading...</div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3">
                {appointments.map((a) => (
                  <div
                    key={a._id}
                    className="rounded-2xl border border-black/5 bg-[#fbfdf9] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-sm font-black text-slate-900">
                        {isDoctor
                          ? `Patient: ${a.patientId || "-"}`
                          : doctorNameById(a.doctorId)}
                      </div>
                      <div
                        className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusClasses(
                          a.status
                        )}`}
                      >
                        {a.status || "pending"}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-600">
                      {a.date ? new Date(a.date).toLocaleDateString() : "-"} • {a.time || "-"}
                    </div>

                    {a.meetingLink ? (
                      <a
                        href={a.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-extrabold text-[#2f6b14]"
                      >
                        Join live session
                      </a>
                    ) : null}

                    {isPatient ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => payForAppointment(a)}
                          className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421]"
                        >
                          Pay with PayHere
                        </button>
                        <button
                          onClick={() => cancelAppointment(a._id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}

                {!loadingAppointments && appointments.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                    No appointments yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
