import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";
import { normalizeApiPayload, useDoctorServiceId } from "./doctorUtils";
import banner from "../../assets/patientassets/banner2.png";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function sameCalendarDay(value, selectedDate) {
  if (!selectedDate) return true;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const isoDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  return isoDate === selectedDate;
}

function medicineSummary(medicines) {
  if (!Array.isArray(medicines) || medicines.length === 0) return "No medicines listed";
  return medicines.map((item) => item?.name).filter(Boolean).join(", ");
}

export default function DoctorPrescriptionHistory() {
  const { doctorId, resolving, resolvedFrom } = useDoctorServiceId();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientIdFilter, setPatientIdFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  const loadPrescriptions = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (!doctorId) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(`/api/doctors/${encodeURIComponent(doctorId)}/prescriptions`);
      const payload = normalizeApiPayload(data);
      const list = payload?.data || payload;
      const normalizedList = Array.isArray(list) ? list : [];
      setPrescriptions(normalizedList);
      setMessage(`Loaded ${normalizedList.length} prescriptions.`);
    } catch (err) {
      setPrescriptions([]);
      setError(err?.response?.data?.message || "Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const filteredPrescriptions = useMemo(() => {
    const patientQuery = patientIdFilter.trim().toLowerCase();

    return prescriptions
      .filter((item) => {
        const patientMatch = !patientQuery || String(item?.patientId || "").toLowerCase().includes(patientQuery);
        const dateValue = item?.prescriptionDate || item?.createdAt;
        const dateMatch = sameCalendarDay(dateValue, dateFilter);

        return patientMatch && dateMatch;
      })
      .sort((a, b) => {
        const aTime = new Date(a?.prescriptionDate || a?.createdAt || 0).getTime();
        const bTime = new Date(b?.prescriptionDate || b?.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }, [dateFilter, patientIdFilter, prescriptions]);

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[210px] sm:h-[250px] lg:h-[290px]">
            <img
              src={banner}
              alt="Prescription history"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />
            <div className="relative flex h-full items-center p-5 sm:p-8">
              <div className="max-w-2xl">
                <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#00bbb3]">
                  Prescription Service
                </div>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Prescription History
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                  Search saved prescriptions by patient ID or prescription date and review previous treatment details.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">History Search</h2>
              <p className="mt-1 text-sm text-slate-600">Filter your prescriptions without leaving the doctor workspace.</p>
            </div>

            <button
              onClick={loadPrescriptions}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14] transition hover:bg-[#80c342]/20"
            >
              Refresh prescriptions
            </button>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Login as a verified doctor to review prescription history.
            </div>
          ) : null}

          {isLoggedIn() && !doctorId && !resolving ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Doctor service ID could not be resolved from the current login, so prescription history cannot load yet.
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_260px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className="text-xs font-extrabold text-slate-700">Search Patient ID</label>
              <input
                value={patientIdFilter}
                onChange={(e) => setPatientIdFilter(e.target.value)}
                placeholder="Search by patient id"
                className={inputClass}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-5">
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Doctor Session</div>
              <div className="mt-3 text-sm font-semibold text-slate-900">
                {doctorId || "Resolving doctor ID..."}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {resolvedFrom ? `Resolved from: ${resolvedFrom}` : null}
                {resolving ? " (resolving...)" : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className="text-xs font-extrabold text-slate-700">Prescription Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
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

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <div className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              Total: {prescriptions.length}
            </div>
            <div className="rounded-full bg-[#00bbb3]/10 px-3 py-1 font-semibold text-[#006b67]">
              Matching: {filteredPrescriptions.length}
            </div>
            {(patientIdFilter || dateFilter) && (
              <button
                onClick={() => {
                  setPatientIdFilter("");
                  setDateFilter("");
                }}
                className="rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-6">
            {loading ? <div className="text-sm text-slate-600">Loading prescriptions...</div> : null}

            {!loading && filteredPrescriptions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No prescriptions found for the current search.
              </div>
            ) : null}

            <div className="grid gap-4">
              {filteredPrescriptions.map((item) => (
                <article
                  key={item?._id}
                  className="rounded-2xl border border-black/5 bg-[linear-gradient(180deg,#ffffff,#fbfdff)] p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{item?.diagnosis || "Diagnosis not recorded"}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                        <span>Patient ID: {item?.patientId || "-"}</span>
                        <span>Appointment ID: {item?.appointmentId || "-"}</span>
                        <span>Date: {formatDateTime(item?.prescriptionDate || item?.createdAt)}</span>
                      </div>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      {Array.isArray(item?.medicines) ? item.medicines.length : 0} medicines
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Medicine Summary</div>
                      <div className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                        {medicineSummary(item?.medicines)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Prescription Date</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {formatDate(item?.prescriptionDate || item?.createdAt)}
                      </div>
                    </div>
                  </div>

                  {item?.notes ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Notes</div>
                      <div className="mt-2 text-sm leading-6 text-slate-700">{item.notes}</div>
                    </div>
                  ) : null}

                  {Array.isArray(item?.medicines) && item.medicines.length > 0 ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                      <div className="grid grid-cols-4 gap-0 bg-slate-50 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        <div>Medicine</div>
                        <div>Dosage</div>
                        <div>Frequency</div>
                        <div>Duration</div>
                      </div>
                      {item.medicines.map((medicine, index) => (
                        <div
                          key={`${item?._id}-medicine-${index}`}
                          className="grid grid-cols-4 gap-0 border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                        >
                          <div className="font-semibold text-slate-900">{medicine?.name || "-"}</div>
                          <div>{medicine?.dosage || "-"}</div>
                          <div>{medicine?.frequency || "-"}</div>
                          <div>{medicine?.duration || "-"}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
