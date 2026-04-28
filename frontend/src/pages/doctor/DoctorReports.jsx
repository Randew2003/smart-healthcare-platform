import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";
import { formatDateTime, useDoctorServiceId } from "./doctorUtils";
import banner from "../../assets/patientassets/banner2.png";

const REPORTS_SEEN_EVENT = "doctorReports:seen";

function markReportsSeen(doctorId) {
  const normalizedDoctorId = String(doctorId || "").trim();
  if (!normalizedDoctorId) return;

  localStorage.setItem(
    `doctor:lastSeenReportAt:${normalizedDoctorId}`,
    new Date().toISOString()
  );
  window.dispatchEvent(new Event(REPORTS_SEEN_EVENT));
}

export default function DoctorReports() {
  const { doctorId, resolving, resolvedFrom } = useDoctorServiceId();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadReports = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (!doctorId) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(
        `/api/patients/doctor-view/reports?doctorId=${encodeURIComponent(doctorId)}`
      );
      const list = Array.isArray(data) ? data : [];
      setReports(list);
      setMessage(`Loaded ${list.length} reports.`);
      markReportsSeen(doctorId);
    } catch (err) {
      setReports([]);
      setError(err?.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  const downloadReport = useCallback(async (report) => {
    if (!report?.patientId || !report?._id) return;

    try {
      const response = await api.get(
        `/api/patients/doctor-view/${encodeURIComponent(report.patientId)}/reports/${encodeURIComponent(report._id)}/file`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = report?.fileName || `report_${String(report._id).slice(0, 12)}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to download report.");
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredReports = useMemo(() => {
    const query = String(searchTerm || "").trim().toLowerCase();
    if (!query) return reports;

    return reports.filter((report) => {
      const haystack = [
        report?.patientName,
        report?.patientId,
        report?.fileName,
        report?.prescriptionId
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return haystack.includes(query);
    });
  }, [reports, searchTerm]);

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[210px] sm:h-[250px] lg:h-[290px]">
            <img
              src={banner}
              alt="Doctor reports"
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
                  Patient Reports
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                  Review uploaded patient reports with the patient name, patient ID, and upload time in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Reports Inbox</h2>
              <p className="mt-1 text-sm text-slate-600">
                New uploads from your patients appear here automatically.
              </p>
            </div>

            <button
              onClick={loadReports}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14] transition hover:bg-[#80c342]/20"
            >
              Refresh reports
            </button>
          </div>

          {isLoggedIn() && !doctorId && !resolving ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Doctor service ID could not be resolved from the current login, so reports cannot load yet.
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className="text-xs font-extrabold text-slate-700">
                Search by patient name, patient ID, report, or prescription ID
              </label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20"
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
              Total: {reports.length}
            </div>
            <div className="rounded-full bg-[#00bbb3]/10 px-3 py-1 font-semibold text-[#006b67]">
              Matching: {filteredReports.length}
            </div>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear search
              </button>
            ) : null}
          </div>

          <div className="mt-6">
            {loading ? <div className="text-sm text-slate-600">Loading reports...</div> : null}

            {!loading && filteredReports.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No reports found for the current search.
              </div>
            ) : null}

            <div className="grid gap-4">
              {filteredReports.map((report) => (
                <article
                  key={report?._id}
                  className="rounded-2xl border border-black/5 bg-[linear-gradient(180deg,#ffffff,#fbfdff)] p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {report?.fileName || "Medical report"}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                        <span>Patient: {report?.patientName || "-"}</span>
                        <span>Patient ID: {report?.patientId || "-"}</span>
                        <span>Prescription ID: {report?.prescriptionId || "-"}</span>
                        <span>Uploaded: {formatDateTime(report?.uploadedAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadReport(report)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50"
                    >
                      Download
                    </button>
                  </div>

                  {report?.doctorFeedback ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        Existing Feedback
                      </div>
                      <div className="mt-2 text-sm text-slate-700">{report.doctorFeedback}</div>
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
