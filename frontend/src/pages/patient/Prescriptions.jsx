import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";
import jsPDF from "jspdf";

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

function asNonEmpty(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function buildPrescriptionPdf(prescription, doctorLabel) {
  const doc = new jsPDF();

  const title = "Prescription";
  const patientId = asNonEmpty(prescription?.patientId, "-");
  const prescriptionId = asNonEmpty(prescription?._id, "-");
  const appointmentId = asNonEmpty(prescription?.appointmentId, "-");
  const diagnosis = asNonEmpty(prescription?.diagnosis, "-");
  const notes = asNonEmpty(prescription?.notes, "-");
  const createdAt = prescription?.prescriptionDate || prescription?.createdAt;

  let y = 18;
  doc.setFontSize(18);
  doc.text(title, 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.text(`Date: ${formatDateTime(createdAt)}`, 14, y);
  y += 6;
  doc.text(`Doctor: ${doctorLabel}`, 14, y);
  y += 6;
  doc.text(`Patient ID: ${patientId}`, 14, y);
  y += 6;
  doc.text(`Prescription ID: ${prescriptionId}`, 14, y);
  y += 6;
  doc.text(`Appointment ID: ${appointmentId}`, 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Diagnosis", 14, y);
  y += 6;
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(diagnosis, 180), 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Medicines", 14, y);
  y += 6;

  const medicines = Array.isArray(prescription?.medicines) ? prescription.medicines : [];
  if (medicines.length === 0) {
    doc.setFontSize(11);
    doc.text("No medicines listed.", 14, y);
    y += 8;
  } else {
    doc.setFontSize(11);
    medicines.forEach((item, index) => {
      const row = `${index + 1}. ${asNonEmpty(item?.name, "-")} | ${asNonEmpty(item?.dosage, "-")} | ${asNonEmpty(
        item?.frequency,
        "-"
      )} | ${asNonEmpty(item?.duration, "-")}`;
      const lines = doc.splitTextToSize(row, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
    });
  }

  doc.setFontSize(12);
  doc.text("Notes", 14, y);
  y += 6;
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(notes, 180), 14, y);

  return doc;
}

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function Prescriptions() {
  const user = getUser();
  const patientId = user?.id || user?._id || "";

  const prescriptionsSeenKey = patientId
    ? `patient:lastSeenPrescriptionAt:${patientId}`
    : "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorLookup, setDoctorLookup] = useState({});
  const [reports, setReports] = useState([]);
  const [uploading, setUploading] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const loadPrescriptions = useCallback(async () => {
    if (!isLoggedIn() || !patientId) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/prescriptions/patient/${encodeURIComponent(patientId)}`);
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setPrescriptions(list);

      if (prescriptionsSeenKey) {
        const maxCreatedAt = list.reduce((maxTs, item) => {
          const createdAtRaw = item?.createdAt;
          const ts = createdAtRaw ? Date.parse(createdAtRaw) : NaN;
          if (!Number.isFinite(ts)) return maxTs;
          return Math.max(maxTs, ts);
        }, 0);

        const nextSeen = maxCreatedAt > 0 ? new Date(maxCreatedAt).toISOString() : new Date().toISOString();
        localStorage.setItem(prescriptionsSeenKey, nextSeen);
        window.dispatchEvent(new Event("prescriptions:seen"));
      }

      const uniqueDoctorIds = [...new Set(list.map((p) => p?.doctorId).filter(Boolean))];
      const doctorEntries = await Promise.all(
        uniqueDoctorIds.map(async (doctorId) => {
          try {
            const response = await api.get(`/api/doctors/${encodeURIComponent(doctorId)}`);
            const payload = response?.data?.data || response?.data;
            const name = payload?.name ? `Dr. ${payload.name}` : doctorId;
            return [doctorId, name];
          } catch {
            return [doctorId, doctorId];
          }
        })
      );
      setDoctorLookup(Object.fromEntries(doctorEntries));
    } catch (err) {
      setPrescriptions([]);
      setDoctorLookup({});
      setError(err?.response?.data?.message || "Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  }, [patientId, prescriptionsSeenKey]);

  const loadReports = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const { data } = await api.get("/api/patients/reports");
      setReports(Array.isArray(data) ? data : []);
    } catch {
      setReports([]);
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
    loadReports();
  }, [loadPrescriptions, loadReports]);

  const reportsByPrescriptionId = useMemo(() => {
    const map = {};
    (Array.isArray(reports) ? reports : []).forEach((report) => {
      const key = String(report?.prescriptionId || "").trim();
      if (!key) return;
      map[key] = map[key] || [];
      map[key].push(report);
    });
    return map;
  }, [reports]);

  const handleDownloadPdf = (prescription) => {
    const doctorLabel = doctorLookup[prescription?.doctorId] || prescription?.doctorId || "-";
    const doc = buildPrescriptionPdf(prescription, doctorLabel);
    const safeId = String(prescription?._id || "prescription").slice(0, 12);
    doc.save(`prescription_${safeId}.pdf`);
  };

  const handleUploadReport = async (prescription, file) => {
    if (!file) return;
    if (!prescription?._id || !prescription?.doctorId) return;

    setUploading(String(prescription._id));
    setUploadError("");
    setUploadMessage("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("doctorId", String(prescription.doctorId));
      form.append("prescriptionId", String(prescription._id));

      const { data } = await api.post("/api/patients/reports/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadMessage(data?.message || "Report uploaded.");
      await loadReports();
    } catch (err) {
      setUploadError(err?.response?.data?.message || "Failed to upload report.");
    } finally {
      setUploading("");
    }
  };

  const handleDownloadReport = async (report) => {
    if (!report?._id) return;
    try {
      const response = await api.get(`/api/patients/reports/${encodeURIComponent(report._id)}/file`, {
        responseType: "blob"
      });
      downloadBlob(response.data, report?.fileName || `report_${String(report._id).slice(0, 12)}`);
    } catch {
      setUploadError("Failed to download report.");
    }
  };

  const cardClass = "rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm";

  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">Prescriptions</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2459A6] sm:text-4xl">Your Prescriptions</h1>
            </div>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              View prescriptions issued by your doctors, download them as a PDF, and upload any requested medical reports.
            </p>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-8 rounded-xl border border-[#D8EAF6] bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
              Please login to view your prescriptions.
            </div>
          ) : null}

          {error ? (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {uploadError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {uploadError}
            </div>
          ) : null}

          {uploadMessage ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
              {uploadMessage}
            </div>
          ) : null}

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className={cardClass}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#35B85A]">Total Records</p>
              <h2 className="mt-3 text-3xl font-bold text-[#2459A6]">{prescriptions.length}</h2>
              <p className="mt-2 text-sm text-slate-500">All saved prescriptions</p>
            </div>

            <div className={cardClass}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#35B85A]">Patient</p>
              <h2 className="mt-3 text-lg font-bold text-[#2459A6]">{user?.fullName || "Patient"}</h2>
              <p className="mt-2 text-sm text-slate-500">ID: {patientId || "-"}</p>
            </div>

            <div className={cardClass}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#35B85A]">Reports</p>
              <h2 className="mt-3 text-3xl font-bold text-[#2459A6]">{reports.length}</h2>
              <p className="mt-2 text-sm text-slate-500">Uploaded medical reports</p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-4 border-b border-[#D8EAF6] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2459A6]">Prescription List</h2>
                <p className="mt-1 text-sm text-slate-500">Download or upload requested reports per prescription.</p>
              </div>

              <button
                onClick={() => {
                  loadPrescriptions();
                  loadReports();
                }}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#2477B8]/30 bg-[#EAF6FF] px-5 text-sm font-semibold text-[#2477B8] transition hover:bg-[#2477B8] hover:text-white"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-8 rounded-xl border border-[#D8EAF6] bg-[#F6FAFD] px-5 py-10 text-center text-sm text-slate-500">
                Loading prescriptions...
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="mt-8 rounded-xl border border-[#D8EAF6] bg-[#F6FAFD] px-5 py-12 text-center">
                <h3 className="text-lg font-semibold text-[#2459A6]">No prescriptions yet</h3>
                <p className="mt-2 text-sm text-slate-500">Your prescriptions will appear here after your doctor issues them.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {prescriptions.map((p) => {
                  const doctorLabel = doctorLookup[p?.doctorId] || p?.doctorId || "-";
                  const createdAt = p?.prescriptionDate || p?.createdAt;
                  const relatedReports = reportsByPrescriptionId[String(p?._id || "")] || [];

                  return (
                    <article key={p?._id} className="rounded-2xl border border-[#D8EAF6] bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{p?.diagnosis || "Diagnosis not recorded"}</h3>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                            <span>Doctor: {doctorLabel}</span>
                            <span>Date: {formatDateTime(createdAt)}</span>
                            <span>Appointment: {p?.appointmentId || "-"}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleDownloadPdf(p)}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Download PDF
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medicines</div>
                        <div className="mt-2 text-sm text-slate-700">
                          {(Array.isArray(p?.medicines) ? p.medicines : []).length === 0
                            ? "No medicines listed."
                            : (p.medicines || []).map((m, index) => (
                                <div key={`${p?._id}_m_${index}`} className="py-1">
                                  <span className="font-semibold">{m?.name || "-"}</span>
                                  <span className="text-slate-500"> — {m?.dosage || "-"}, {m?.frequency || "-"}, {m?.duration || "-"}</span>
                                </div>
                              ))}
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</div>
                        <div className="mt-2 text-sm text-slate-700">{p?.notes || "-"}</div>
                      </div>

                      {p?.requiresMedicalReport ? (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">Medical report requested</div>
                          <div className="mt-2 text-sm text-amber-900">
                            {p?.medicalReportRequestNote || "Your doctor requested you to upload medical reports for this prescription."}
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                handleUploadReport(p, file);
                              }}
                              className="block w-full text-sm"
                              disabled={uploading === String(p?._id)}
                            />
                            <div className="text-sm text-slate-600">
                              {uploading === String(p?._id) ? "Uploading..." : `${relatedReports.length} uploaded`}
                            </div>
                          </div>

                          {relatedReports.length > 0 ? (
                            <div className="mt-4 grid gap-2">
                              {relatedReports.map((report) => (
                                <div key={report?._id} className="flex flex-col gap-1 rounded-lg border border-amber-200 bg-white px-3 py-2">
                                  <div className="text-sm font-semibold text-slate-900">{report?.fileName || "Report"}</div>
                                  <div className="text-xs text-slate-500">Uploaded: {formatDateTime(report?.uploadedAt)}</div>
                                  <button
                                    onClick={() => handleDownloadReport(report)}
                                    className="text-left text-sm font-semibold text-[#2459A6]"
                                  >
                                    Download report
                                  </button>
                                  {report?.doctorFeedback ? (
                                    <div className="mt-2 text-xs text-slate-700">
                                      <span className="font-semibold">Doctor feedback:</span> {report.doctorFeedback}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
