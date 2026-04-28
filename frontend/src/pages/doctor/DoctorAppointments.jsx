import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";
import { normalizeApiPayload, statusBadgeClasses, useDoctorServiceId } from "./doctorUtils";
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

function createMedicine() {
  return {
    name: "",
    dosage: "",
    frequency: "",
    duration: ""
  };
}

function createPrescriptionDraft(appointment) {
  const createdAt = new Date().toISOString();

  return {
    patientId: appointment?.patientId || "",
    appointmentId: appointment?._id || "",
    prescriptionDate: createdAt,
    diagnosis: "",
    medicines: [createMedicine()],
    notes: "",
    requiresMedicalReport: false,
    medicalReportRequestNote: ""
  };
}

function getAppointmentSortTime(appointment) {
  const rawDate = appointment?.date;
  const rawTime = String(appointment?.time || "").trim();

  if (!rawDate) return 0;

  const combined = rawTime ? `${rawDate} ${rawTime}` : `${rawDate}`;
  const parsed = new Date(combined);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime();
  }

  const fallback = new Date(rawDate);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.getTime();
  }

  return 0;
}

function getCreatedAtSortTime(appointment) {
  const parsed = new Date(appointment?.createdAt || appointment?.updatedAt || 0);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function summarizePrescription(prescription) {
  const medicines = Array.isArray(prescription?.medicines) ? prescription.medicines : [];
  if (medicines.length === 0) return "No medicines listed";
  return medicines.map((item) => item?.name).filter(Boolean).join(", ");
}

export default function DoctorAppointments() {
  const { doctorId, resolving } = useDoctorServiceId();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [activePrescriptionId, setActivePrescriptionId] = useState("");
  const [prescriptionForm, setPrescriptionForm] = useState(null);
  const [prescriptionSaving, setPrescriptionSaving] = useState(false);
  const [prescriptionHistory, setPrescriptionHistory] = useState({});
  const [prescriptionHistoryLoading, setPrescriptionHistoryLoading] = useState({});

  const load = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (!doctorId) {
      if (!resolving) {
        setAppointments([]);
        setError("Doctor profile is not linked yet. Open Doctor Profile to create/sync your doctor-service profile.");
      }
      return;
    }

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
  }, [doctorId, resolving]);

  useEffect(() => {
    load();
  }, [load]);

  const loadPrescriptionHistory = useCallback(
    async (appointment) => {
      const patientId = appointment?.patientId;
      if (!doctorId || !patientId) return;

      setPrescriptionHistoryLoading((current) => ({
        ...current,
        [appointment._id]: true
      }));

      try {
        const { data } = await api.get(
          `/api/doctors/${encodeURIComponent(doctorId)}/prescriptions/patient/${encodeURIComponent(patientId)}`
        );
        const payload = normalizeApiPayload(data);
        const list = payload?.data || payload;

        setPrescriptionHistory((current) => ({
          ...current,
          [appointment._id]: Array.isArray(list) ? list : []
        }));
      } catch {
        setPrescriptionHistory((current) => ({
          ...current,
          [appointment._id]: []
        }));
      } finally {
        setPrescriptionHistoryLoading((current) => ({
          ...current,
          [appointment._id]: false
        }));
      }
    },
    [doctorId]
  );

  const openPrescriptionComposer = async (appointment) => {
    const nextId = appointment?._id || "";

    if (!nextId) return;

    setActivePrescriptionId(nextId);
    setPrescriptionForm(createPrescriptionDraft(appointment));
    setError("");
    setMessage("");

    await loadPrescriptionHistory(appointment);
  };

  const closePrescriptionComposer = () => {
    setActivePrescriptionId("");
    setPrescriptionForm(null);
  };

  const updatePrescriptionField = (field, value) => {
    setPrescriptionForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateMedicineField = (index, field, value) => {
    setPrescriptionForm((current) => {
      const medicines = Array.isArray(current?.medicines) ? [...current.medicines] : [];
      medicines[index] = {
        ...(medicines[index] || createMedicine()),
        [field]: value
      };

      return {
        ...current,
        medicines
      };
    });
  };

  const addMedicineRow = () => {
    setPrescriptionForm((current) => ({
      ...current,
      medicines: [...(current?.medicines || []), createMedicine()]
    }));
  };

  const removeMedicineRow = (index) => {
    setPrescriptionForm((current) => {
      const medicines = (current?.medicines || []).filter((_, itemIndex) => itemIndex !== index);

      return {
        ...current,
        medicines: medicines.length > 0 ? medicines : [createMedicine()]
      };
    });
  };

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

  const submitPrescription = async (appointment) => {
    if (!doctorId || !appointment?._id || !prescriptionForm) return;

    const cleanedMedicines = (prescriptionForm.medicines || []).filter((item) => {
      return item?.name || item?.dosage || item?.frequency || item?.duration;
    });

    if (!prescriptionForm.diagnosis.trim()) {
      setError("Diagnosis is required before saving the prescription.");
      return;
    }

    if (cleanedMedicines.length === 0) {
      setError("Add at least one medicine before saving the prescription.");
      return;
    }

    const hasIncompleteMedicine = cleanedMedicines.some((item) => {
      return !item?.name?.trim() || !item?.dosage?.trim() || !item?.frequency?.trim() || !item?.duration?.trim();
    });

    if (hasIncompleteMedicine) {
      setError("Complete every medicine row before saving the prescription.");
      return;
    }

    setPrescriptionSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...prescriptionForm,
        patientId: appointment.patientId,
        appointmentId: appointment._id,
        prescriptionDate: prescriptionForm.prescriptionDate || new Date().toISOString(),
        diagnosis: prescriptionForm.diagnosis.trim(),
        requiresMedicalReport: Boolean(prescriptionForm.requiresMedicalReport),
        medicalReportRequestNote: String(prescriptionForm.medicalReportRequestNote || "").trim(),
        medicines: cleanedMedicines.map((item) => ({
          name: item.name.trim(),
          dosage: item.dosage.trim(),
          frequency: item.frequency.trim(),
          duration: item.duration.trim()
        })),
        notes: prescriptionForm.notes.trim()
      };

      const { data } = await api.post(
        `/api/doctors/${encodeURIComponent(doctorId)}/prescriptions`,
        payload
      );

      // Notify patient (email/SMS) using existing notification-service behavior.
      api
        .post("/api/notifications/event", {
          type: "PRESCRIPTION_CREATED",
          patient: {
            email: appointment?.patientEmail
          },
          doctor: {
            email: doctorUser?.email
          }
        })
        .catch(() => undefined);

      setMessage(data?.message || "Prescription created successfully.");
      await loadPrescriptionHistory(appointment);
      closePrescriptionComposer();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save prescription.");
    } finally {
      setPrescriptionSaving(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  const textareaClass = `${inputClass} min-h-[112px] resize-y`;

  const appointmentCards = useMemo(() => {
    return [...appointments]
      .sort((a, b) => getCreatedAtSortTime(b) - getCreatedAtSortTime(a))
      .map((appointment) => {
        const patient = appointment?.patientProfile;

        return {
          ...appointment,
          patientName: patient?.fullName || appointment?.patientId || "-",
          patientEmail: patient?.email || "-",
          visitReason: appointment?.notes || "No reason provided",
          appointmentDate: formatDate(appointment?.date),
          appointmentDateTime: formatDateTime(getAppointmentSortTime(appointment)),
          canPrescribe: Boolean(appointment?.patientId)
        };
      });
  }, [appointments]);

  const activeAppointment = useMemo(() => {
    return appointmentCards.find((appointment) => appointment?._id === activePrescriptionId) || null;
  }, [activePrescriptionId, appointmentCards]);

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[220px] sm:h-[260px] lg:h-[300px]">
            <img
              src={banner}
              alt="Doctor appointments"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,250,252,0.96),rgba(248,250,252,0.86),rgba(255,255,255,0.1))]" />
            <div className="relative flex h-full items-center p-5 sm:p-8">
              <div className="max-w-3xl">
                <div className="inline-flex rounded-full border border-[#00bbb3]/20 bg-[#00bbb3]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.24em] text-[#007d77]">
                  Consultation Desk
                </div>
                <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
                  Manage appointments and prescribe during the visit
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
                  Review patient details, mark visit progress, and write a prescription with the timestamp captured at creation time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Today&apos;s appointment workspace</h2>
              <p className="mt-1 text-sm text-slate-600">
                Open a patient card to confirm the visit and create prescriptions without leaving the appointment screen.
              </p>
            </div>

            <button
              onClick={load}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14] transition hover:bg-[#80c342]/20"
            >
              Refresh appointments
            </button>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Login as a verified doctor to manage appointments.
            </div>
          ) : null}

          {/*<div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-[#f7fbf5] p-5">
              <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#5c7f31]">Prescription timestamp</div>
              <div className="mt-3 text-sm font-semibold text-slate-900">Automatically saved at creation time</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Each prescription now stores `prescriptionDate` from the moment the doctor saves it, so there is no extra date input during the appointment.
              </p>
            </div>
          </div>*/}

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

            <div className="grid gap-4">
              {appointmentCards.map((appointment) => {
                const isPrescriptionOpen = activePrescriptionId === appointment?._id;
                const historyItems = prescriptionHistory[appointment?._id] || [];
                const isHistoryLoading = Boolean(prescriptionHistoryLoading[appointment?._id]);

                return (
                  <article
                    key={appointment?._id}
                    className="overflow-hidden rounded-2xl border border-black/5 bg-[linear-gradient(180deg,#ffffff,#f8fbfd)] shadow-sm"
                  >
                    <div className="border-b border-slate-200/80 px-5 py-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-lg font-black text-slate-900">{appointment?.patientName}</div>
                            <div
                              className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusBadgeClasses(
                                appointment?.status
                              )}`}
                            >
                              {appointment?.status || "pending"}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                            <span>Patient ID: {appointment?.patientId || "-"}</span>
                            <span>Appointment: {appointment?.appointmentDate}</span>
                            <span>Time: {appointment?.time || "-"}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {appointment?.status !== "Confirmed" && appointment?.status !== "Completed" ? (
                            <button
                              onClick={() => accept(appointment?._id)}
                              disabled={actionLoading === appointment?._id}
                              className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white transition hover:bg-[#60a421] disabled:opacity-60"
                            >
                              {actionLoading === appointment?._id ? "Working..." : "Accept"}
                            </button>
                          ) : null}

                          {appointment?.status === "Confirmed" ? (
                            <button
                              onClick={() => endMeeting(appointment?._id)}
                              disabled={actionLoading === appointment?._id}
                              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
                            >
                              {actionLoading === appointment?._id ? "Working..." : "End Meeting"}
                            </button>
                          ) : null}

                          <button
                            onClick={() =>
                              isPrescriptionOpen
                                ? closePrescriptionComposer()
                                : openPrescriptionComposer(appointment)
                            }
                            disabled={!appointment?.canPrescribe}
                            className="rounded-xl border border-[#00bbb3]/30 bg-[#00bbb3]/10 px-4 py-2 text-sm font-black text-[#006b67] transition hover:bg-[#00bbb3]/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPrescriptionOpen ? "Close prescription" : "Add prescription"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-0 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
                      <div className="px-5 py-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Patient Email</div>
                            <div className="mt-2 break-words text-sm font-semibold text-slate-900">{appointment?.patientEmail}</div>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Visit Time</div>
                            <div className="mt-2 break-words text-sm font-semibold text-slate-900">{appointment?.appointmentDateTime}</div>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-4">
                          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Reason to Visit</div>
                          <div className="mt-2 text-sm font-semibold leading-6 text-slate-900">{appointment?.visitReason}</div>
                        </div>

                        {appointment?.meetingLink ? (
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex text-sm font-extrabold text-[#2f6b14]"
                          >
                            Join live session
                          </a>
                        ) : null}

                        {appointment?.status === "Confirmed" ? (
                          <div className="mt-3 text-sm font-semibold text-[#2f6b14]">Status: Meeting ongoing</div>
                        ) : null}

                        {appointment?.status === "Completed" ? (
                          <div className="mt-3 text-sm font-semibold text-slate-700">Status: Meeting ended</div>
                        ) : null}
                      </div>

                      <aside className="border-t border-slate-200 bg-[#f8fbff] px-5 py-5 xl:border-l xl:border-t-0">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Prescription History</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">For this patient under this doctor</div>
                          </div>
                          <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                            {historyItems.length} records
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {isHistoryLoading ? <div className="text-sm text-slate-500">Loading prescriptions...</div> : null}

                          {!isHistoryLoading && historyItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                              No prescriptions saved for this patient yet.
                            </div>
                          ) : null}

                          {!isHistoryLoading &&
                            historyItems.slice(0, 3).map((item) => (
                              <div key={item?._id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="text-sm font-bold text-slate-900">{item?.diagnosis || "Diagnosis not recorded"}</div>
                                  <div className="shrink-0 text-xs font-semibold text-slate-500">
                                    {formatDateTime(item?.prescriptionDate || item?.createdAt)}
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-slate-600">{summarizePrescription(item)}</div>
                              </div>
                            ))}
                        </div>
                      </aside>
                    </div>

                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {activeAppointment && prescriptionForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] px-6 py-5">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#007d77]">Prescription</div>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Add prescription for {activeAppointment.patientName}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Saving will stamp the prescription with this creation time:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatDateTime(prescriptionForm.prescriptionDate)}
                  </span>
                </p>
              </div>

              <button
                onClick={closePrescriptionComposer}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(90vh-92px)] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_320px]">
                <div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                        Diagnosis
                      </label>
                      <textarea
                        value={prescriptionForm.diagnosis}
                        onChange={(e) => updatePrescriptionField("diagnosis", e.target.value)}
                        className={textareaClass}
                        placeholder="Write the clinical diagnosis or summary of findings"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                        Notes
                      </label>
                      <textarea
                        value={prescriptionForm.notes}
                        onChange={(e) => updatePrescriptionField("notes", e.target.value)}
                        className={textareaClass}
                        placeholder="Add follow-up guidance, rest instructions, or review notes"
                      />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-[#fbfcfe] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
                          Medical Reports
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Request the patient to upload medical reports related to this prescription.
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={Boolean(prescriptionForm.requiresMedicalReport)}
                          onChange={(e) => updatePrescriptionField("requiresMedicalReport", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#80c342] focus:ring-[#80c342]/30"
                        />
                        Request reports
                      </label>
                    </div>

                    {prescriptionForm.requiresMedicalReport ? (
                      <div className="mt-4">
                        <label className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                          Request note (optional)
                        </label>
                        <textarea
                          value={prescriptionForm.medicalReportRequestNote}
                          onChange={(e) => updatePrescriptionField("medicalReportRequestNote", e.target.value)}
                          className={textareaClass}
                          placeholder="Example: Please upload your latest blood test report and any imaging results."
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Medicines</div>
                      <div className="mt-1 text-sm text-slate-600">Add each medicine with dose, frequency, and duration.</div>
                    </div>

                    <button
                      onClick={addMedicineRow}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:bg-slate-50"
                    >
                      Add medicine
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {prescriptionForm.medicines.map((medicine, index) => (
                      <div
                        key={`${activePrescriptionId}-medicine-${index}`}
                        className="grid gap-3 rounded-2xl border border-slate-200 bg-[#fbfcfe] p-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.9fr))_auto]"
                      >
                        <div>
                          <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Medicine</label>
                          <input
                            value={medicine.name}
                            onChange={(e) => updateMedicineField(index, "name", e.target.value)}
                            className={inputClass}
                            placeholder="Amoxicillin 500mg"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Dosage</label>
                          <input
                            value={medicine.dosage}
                            onChange={(e) => updateMedicineField(index, "dosage", e.target.value)}
                            className={inputClass}
                            placeholder="1 tablet"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Frequency</label>
                          <input
                            value={medicine.frequency}
                            onChange={(e) => updateMedicineField(index, "frequency", e.target.value)}
                            className={inputClass}
                            placeholder="Twice daily"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Duration</label>
                          <input
                            value={medicine.duration}
                            onChange={(e) => updateMedicineField(index, "duration", e.target.value)}
                            className={inputClass}
                            placeholder="5 days"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => removeMedicineRow(index)}
                            disabled={prescriptionForm.medicines.length === 1}
                            className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-5">
                  <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Visit Snapshot</div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Patient</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{activeAppointment.patientName}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Appointment</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{activeAppointment.appointmentDate}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Reason</div>
                      <div className="mt-2 text-sm leading-6 text-slate-700">{activeAppointment.visitReason}</div>
                    </div>
                  </div>

                  <div className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Recent Prescriptions</div>
                  <div className="mt-3 space-y-3">
                    {(prescriptionHistory[activeAppointment._id] || []).slice(0, 3).map((item) => (
                      <div key={item?._id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="text-sm font-bold text-slate-900">{item?.diagnosis || "Diagnosis not recorded"}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          {formatDateTime(item?.prescriptionDate || item?.createdAt)}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">{summarizePrescription(item)}</div>
                      </div>
                    ))}
                    {!prescriptionHistoryLoading[activeAppointment._id] &&
                    (prescriptionHistory[activeAppointment._id] || []).length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                        No prescriptions saved for this patient yet.
                      </div>
                    ) : null}
                    {prescriptionHistoryLoading[activeAppointment._id] ? (
                      <div className="text-sm text-slate-500">Loading prescriptions...</div>
                    ) : null}
                  </div>
                </aside>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  onClick={closePrescriptionComposer}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitPrescription(activeAppointment)}
                  disabled={prescriptionSaving}
                  className="rounded-xl bg-[#00bbb3] px-5 py-2 text-sm font-black text-white transition hover:bg-[#01978f] disabled:opacity-60"
                >
                  {prescriptionSaving ? "Saving..." : "Save prescription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
}
