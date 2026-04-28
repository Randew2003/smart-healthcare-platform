import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";
import jsPDF from "jspdf";

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

function cleanText(value, fallback = "-") {
  const text = String(value || "").trim();
  return text || fallback;
}

function createPrescriptionPdf(prescription, doctorName) {
  const doc = new jsPDF();
  let y = 18;

  doc.setFontSize(20);
  doc.text("Prescription", 14, y);
  y += 12;

  doc.setFontSize(11);
  doc.text(`Date: ${formatDate(prescription?.prescriptionDate || prescription?.createdAt)}`, 14, y);
  y += 7;
  doc.text(`Doctor: ${doctorName}`, 14, y);
  y += 7;
  doc.text(`Patient ID: ${cleanText(prescription?.patientId)}`, 14, y);
  y += 10;

  doc.setFontSize(13);
  doc.text("Diagnosis", 14, y);
  y += 7;

  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(cleanText(prescription?.diagnosis), 180), 14, y);
  y += 14;

  doc.setFontSize(13);
  doc.text("Medicines", 14, y);
  y += 7;

  const medicines = Array.isArray(prescription?.medicines)
    ? prescription.medicines
    : [];

  if (medicines.length === 0) {
    doc.setFontSize(11);
    doc.text("No medicines listed.", 14, y);
    y += 8;
  } else {
    doc.setFontSize(11);

    medicines.forEach((medicine, index) => {
      const line = `${index + 1}. ${cleanText(medicine?.name)} - ${cleanText(
        medicine?.dosage
      )}, ${cleanText(medicine?.frequency)}, ${cleanText(medicine?.duration)}`;

      const lines = doc.splitTextToSize(line, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6 + 2;

      if (y > 270) {
        doc.addPage();
        y = 18;
      }
    });
  }

  y += 5;
  doc.setFontSize(13);
  doc.text("Notes", 14, y);
  y += 7;

  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(cleanText(prescription?.notes), 180), 14, y);

  return doc;
}

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName || "medical-record";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export default function Prescriptions() {
  const user = getUser();
  const patientId = user?.id || user?._id || "";

  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorLookup, setDoctorLookup] = useState({});
  const [reports, setReports] = useState([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploadingId, setUploadingId] = useState("");

  const loadPrescriptions = useCallback(async () => {
    if (!isLoggedIn() || !patientId) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(
        `/api/prescriptions/patient/${encodeURIComponent(patientId)}`
      );

      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setPrescriptions(list);

      const doctorIds = [
        ...new Set(list.map((item) => item?.doctorId).filter(Boolean))
      ];

      const doctorEntries = await Promise.all(
        doctorIds.map(async (doctorId) => {
          try {
            const response = await api.get(
              `/api/doctors/${encodeURIComponent(doctorId)}`
            );
            const doctor = response?.data?.data || response?.data;
            return [doctorId, doctor?.name ? `Dr. ${doctor.name}` : doctorId];
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
  }, [patientId]);

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
    const grouped = {};

    reports.forEach((report) => {
      const key = String(report?.prescriptionId || "").trim();
      if (!key) return;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(report);
    });

    return grouped;
  }, [reports]);

  const handleDownloadPrescription = (prescription) => {
    const doctorName =
      doctorLookup[prescription?.doctorId] || prescription?.doctorId || "-";

    const pdf = createPrescriptionPdf(prescription, doctorName);
    const id = String(prescription?._id || "prescription").slice(0, 12);

    pdf.save(`prescription_${id}.pdf`);
  };

  const handleUploadRecord = async (prescription, file) => {
    if (!file || !prescription?._id || !prescription?.doctorId) return;

    setUploadingId(String(prescription._id));
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doctorId", String(prescription.doctorId));
      formData.append("prescriptionId", String(prescription._id));

      const { data } = await api.post("/api/patients/reports/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage(data?.message || "Medical record uploaded successfully.");
      await loadReports();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload medical record.");
    } finally {
      setUploadingId("");
    }
  };

  const handleDownloadRecord = async (report) => {
    if (!report?._id) return;

    try {
      const response = await api.get(
        `/api/patients/reports/${encodeURIComponent(report._id)}/file`,
        {
          responseType: "blob"
        }
      );

      downloadBlob(response.data, report?.fileName || "medical-record");
    } catch {
      setError("Failed to download medical record.");
    }
  };

  return (
    <MainLayout>
      <section className="min-h-screen bg-[#F6FAFD] px-6 py-8 text-slate-800 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-[#D8EAF6] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#35B85A]">
                    Prescriptions
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-[#2459A6]">
                    My Prescriptions
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Download prescriptions and upload medical records.
                  </p>
                </div>

                <button
                  onClick={() => {
                    loadPrescriptions();
                    loadReports();
                  }}
                  className="rounded-lg border border-[#2477B8]/30 bg-[#EAF6FF] px-4 py-2 text-sm font-semibold text-[#2477B8] hover:bg-[#2477B8] hover:text-white"
                >
                  Refresh
                </button>
              </div>
            </div>

            {!isLoggedIn() && (
              <div className="mt-5 rounded-xl border border-[#D8EAF6] bg-white p-4 text-sm text-slate-600">
                Please login to view your prescriptions.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                {message}
              </div>
            )}

            <div className="mt-5">
              {loading ? (
                <div className="rounded-xl border border-[#D8EAF6] bg-white p-8 text-center text-sm text-slate-500">
                  Loading prescriptions...
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="rounded-xl border border-[#D8EAF6] bg-white p-8 text-center">
                  <h2 className="text-lg font-bold text-[#2459A6]">
                    No prescriptions yet
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your prescriptions will appear here after your doctor issues them.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((prescription) => {
                    const doctorName =
                      doctorLookup[prescription?.doctorId] ||
                      prescription?.doctorId ||
                      "-";

                    const date =
                      prescription?.prescriptionDate || prescription?.createdAt;

                    const relatedReports =
                      reportsByPrescriptionId[String(prescription?._id || "")] ||
                      [];

                    const medicines = Array.isArray(prescription?.medicines)
                      ? prescription.medicines
                      : [];

                    return (
                      <article
                        key={prescription?._id}
                        className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#35B85A]">
                              Diagnosis
                            </p>

                            <h2 className="mt-1 text-lg font-bold text-[#2459A6]">
                              {prescription?.diagnosis || "Prescription"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                              {doctorName} • {formatDate(date)}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              handleDownloadPrescription(prescription)
                            }
                            className="rounded-lg bg-[#2459A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4a8a]"
                          >
                            Download PDF
                          </button>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-bold text-slate-800">
                            Medicines
                          </p>

                          {medicines.length === 0 ? (
                            <p className="mt-1 text-sm text-slate-500">
                              No medicines listed.
                            </p>
                          ) : (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {medicines.map((medicine, index) => (
                                <div
                                  key={`${prescription?._id}-medicine-${index}`}
                                  className="rounded-xl bg-[#F6FAFD] px-3 py-2"
                                >
                                  <p className="text-sm font-semibold text-slate-900">
                                    {medicine?.name || "Medicine"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {cleanText(medicine?.dosage)} •{" "}
                                    {cleanText(medicine?.frequency)} •{" "}
                                    {cleanText(medicine?.duration)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {prescription?.notes && (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                            <p className="text-xs font-semibold text-slate-500">
                              Doctor Note
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {prescription.notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Medical Record
                            </p>
                            <p className="text-xs text-slate-500">
                              Add report file if doctor requested.
                            </p>
                          </div>

                          <label className="cursor-pointer rounded-lg border border-[#35B85A]/30 bg-[#35B85A]/10 px-4 py-2 text-center text-sm font-semibold text-[#23823d] hover:bg-[#35B85A] hover:text-white">
                            {uploadingId === String(prescription?._id)
                              ? "Uploading..."
                              : "Add Medical Record"}

                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              disabled={
                                uploadingId === String(prescription?._id)
                              }
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.target.value = "";
                                handleUploadRecord(prescription, file);
                              }}
                            />
                          </label>
                        </div>

                        {relatedReports.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {relatedReports.map((report) => (
                              <div
                                key={report?._id}
                                className="flex flex-col gap-2 rounded-lg bg-[#F6FAFD] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {report?.fileName || "Medical Record"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Uploaded: {formatDate(report?.uploadedAt)}
                                  </p>
                                </div>

                                <button
                                  onClick={() => handleDownloadRecord(report)}
                                  className="text-left text-sm font-semibold text-[#2459A6]"
                                >
                                  Download Record
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}