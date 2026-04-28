import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";
import banner from "../../assets/patientassets/banner2.png";
import { normalizeApiPayload, statusBadgeClasses, useDoctorServiceId } from "./doctorUtils";

const calendarWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultFixedHolidays = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 4, day: 1, name: "Labour Day" },
  { month: 11, day: 25, name: "Christmas Day" }
];

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toISODateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function buildHolidayMap(year, holidayDefs = defaultFixedHolidays) {
  const map = new Map();
  holidayDefs.forEach((holiday) => {
    const date = new Date(year, holiday.month, holiday.day);
    if (!Number.isNaN(date.getTime())) {
      map.set(toISODateKey(date), holiday.name);
    }
  });
  return map;
}

function formatFullDate(value) {
  return value.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatClock(value) {
  return value.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatMonthYear(value) {
  return value.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
}

function getAppointmentSortTime(appointment) {
  const rawDate = appointment?.date;
  const rawTime = String(appointment?.time || "").trim();

  if (!rawDate) return 0;

  const combined = rawTime ? `${rawDate} ${rawTime}` : rawDate;
  const parsed = new Date(combined);

  if (!Number.isNaN(parsed.getTime())) return parsed.getTime();

  const fallback = new Date(rawDate);
  if (!Number.isNaN(fallback.getTime())) return fallback.getTime();

  return 0;
}

function formatAppointmentDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function DoctorDashboard() {
  const { doctorId, resolving } = useDoctorServiceId();
  const [now, setNow] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!isLoggedIn() || !doctorId) {
        setAppointments([]);
        setAppointmentsError("");
        return;
      }

      setAppointmentsLoading(true);
      setAppointmentsError("");

      try {
        const { data } = await api.get(`/api/appointments/doctor/${encodeURIComponent(doctorId)}`);
        const payload = normalizeApiPayload(data);
        setAppointments(Array.isArray(payload) ? payload : []);
      } catch (err) {
        setAppointments([]);
        setAppointmentsError(err?.response?.data?.message || "Failed to load doctor appointments.");
      } finally {
        setAppointmentsLoading(false);
      }
    };

    loadAppointments();
  }, [doctorId]);

  const calendarDays = buildCalendarDays(calendarMonth);
  const holidayMap = buildHolidayMap(calendarMonth.getFullYear());
  const monthHolidayEntries = [...holidayMap.entries()]
    .map(([isoDate, name]) => ({ isoDate, name }))
    .filter(({ isoDate }) => {
      const parsed = new Date(isoDate);
      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.getFullYear() === calendarMonth.getFullYear() &&
        parsed.getMonth() === calendarMonth.getMonth()
      );
    })
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const isCurrentMonth =
    now.getFullYear() === calendarMonth.getFullYear() && now.getMonth() === calendarMonth.getMonth();
  const sortedAppointments = [...appointments].sort((a, b) => getAppointmentSortTime(a) - getAppointmentSortTime(b));
  const upcomingAppointments = sortedAppointments.filter((appointment) => getAppointmentSortTime(appointment) >= Date.now());
  const pendingCount = appointments.filter((appointment) => String(appointment?.status || "").toLowerCase() === "pending").length;
  const confirmedCount = appointments.filter((appointment) => String(appointment?.status || "").toLowerCase() === "confirmed").length;

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

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
          <section className="overflow-hidden rounded-2xl border border-black/5 bg-[linear-gradient(145deg,#0f172a,#164e63)] p-6 text-white shadow-sm">
            <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-200/80">
              Today at a glance
            </div>
            <div className="mt-4 text-4xl font-black sm:text-5xl">{formatClock(now)}</div>
            <div className="mt-3 text-base font-semibold text-slate-100">{formatFullDate(now)}</div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100/80">
                  This month
                </div>
                <div className="mt-2 text-lg font-black">{formatMonthYear(calendarMonth)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100/80">
                  Today
                </div>
                <div className="mt-2 text-lg font-black">{now.getDate()}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#00bbb3]">
                  Calendar
                </div>
                <h2 className="mt-2 text-xl font-black text-slate-900">{formatMonthYear(calendarMonth)}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1))}
                  className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-3 py-2 text-sm font-black text-[#2f6b14] transition hover:bg-[#80c342]/20"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2 text-center">
              {calendarWeekdays.map((day) => (
                <div key={day} className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                const isToday =
                  day &&
                  day.getDate() === now.getDate() &&
                  day.getMonth() === now.getMonth() &&
                  day.getFullYear() === now.getFullYear();

                const holidayName = day ? holidayMap.get(toISODateKey(day)) : "";
                const isHoliday = Boolean(holidayName);

                return (
                  <div
                    key={day ? day.toISOString() : `empty-${index}`}
                    title={holidayName || undefined}
                    className={`relative flex aspect-square items-center justify-center rounded-2xl text-sm font-bold ${
                      !day
                        ? "bg-transparent"
                        : isToday
                          ? "bg-[#00bbb3] text-white shadow-sm"
                          : isHoliday
                            ? "border border-[#fbb033]/30 bg-[#fff8ea] text-slate-800"
                          : isCurrentMonth
                            ? "border border-slate-200 bg-slate-50 text-slate-800"
                            : "border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {day ? (
                      <>
                        <span>{day.getDate()}</span>
                        {isHoliday ? (
                          <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-[#fbb033]" />
                        ) : null}
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Holidays</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#fbb033]" />
                  <span>Marked on calendar</span>
                </div>
              </div>
              {monthHolidayEntries.length === 0 ? (
                <div className="mt-2 text-sm text-slate-600">No holidays configured for this month.</div>
              ) : (
                <div className="mt-2 grid gap-1 text-sm text-slate-700">
                  {monthHolidayEntries.map((entry) => (
                    <div key={entry.isoDate} className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{entry.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{entry.isoDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#00bbb3]">
                My Appointments
              </div>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Logged doctor schedule</h2>
              <p className="mt-1 text-sm text-slate-600">
                Quick view of the appointments assigned to the currently logged doctor.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[320px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Total</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{appointments.length}</div>
              </div>
              <div className="rounded-2xl border border-[#fbb033]/25 bg-[#fff8ea] px-4 py-3">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8a5a00]">Pending</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{pendingCount}</div>
              </div>
              <div className="rounded-2xl border border-[#80c342]/25 bg-[#f7fbf1] px-4 py-3">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#4b6a24]">Confirmed</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{confirmedCount}</div>
              </div>
            </div>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Please login as a doctor to view your appointments.
            </div>
          ) : null}

          {isLoggedIn() && !doctorId && !resolving ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Doctor profile not linked yet, so dashboard appointments cannot be loaded.
            </div>
          ) : null}

          {appointmentsError ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {appointmentsError}
            </div>
          ) : null}

          {appointmentsLoading ? <div className="mt-5 text-sm text-slate-600">Loading appointments...</div> : null}

          {!appointmentsLoading && upcomingAppointments.length === 0 && doctorId ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No upcoming appointments found for this doctor.
            </div>
          ) : null}

          {!appointmentsLoading && upcomingAppointments.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {upcomingAppointments.slice(0, 5).map((appointment) => (
                <article
                  key={appointment?._id}
                  className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-black text-slate-900">
                          {appointment?.patientName || appointment?.patient?.name || "Patient"}
                        </div>
                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusBadgeClasses(
                            appointment?.status
                          )}`}
                        >
                          {appointment?.status || "Scheduled"}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        {formatAppointmentDate(appointment?.date)} at {appointment?.time || "-"}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Reason: {appointment?.notes || "No reason provided"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Appointment ID</div>
                      <div className="mt-2 text-xs font-semibold text-slate-700">{appointment?._id || "-"}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </MainLayout>
  );
}
