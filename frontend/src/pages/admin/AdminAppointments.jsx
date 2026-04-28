import { useEffect, useMemo, useState } from "react";
import { getToken } from "../../utils/auth";
import MainLayout from "../../layouts/MainLayout";

function formatDateText(dateValue) {
  if (!dateValue || Number.isNaN(dateValue.getTime?.())) return "-";

  return dateValue.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatTimeText(dateValue, fallbackTime = "-") {
  if (!dateValue || Number.isNaN(dateValue.getTime?.())) return fallbackTime;

  return dateValue.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatusMeta(status) {
  switch (status) {
    case "Completed":
      return {
        label: "Completed",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500"
      };
    case "Confirmed":
      return {
        label: "Confirmed",
        className: "border-blue-200 bg-blue-50 text-blue-700",
        dot: "bg-blue-500"
      };
    case "Cancelled":
      return {
        label: "Cancelled",
        className: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500"
      };
    default:
      return {
        label: "Pending",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500"
      };
  }
}

function getAppointmentType(row) {
  if (row?.meetingLink && row?.status !== "Cancelled") return "Online session";
  return "Clinic visit";
}

export default function AdminAppointments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});

  const headers = useMemo(() => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("Admin token missing. Please login again.");
        setAppointments([]);
        setDoctorMap({});
        return;
      }

      const doctorsRes = await fetch("/api/doctors", { headers });
      const doctorsData = await doctorsRes.json().catch(() => ({}));
      if (!doctorsRes.ok) {
        throw new Error(doctorsData?.message || "Failed to load doctors.");
      }

      const doctors = Array.isArray(doctorsData)
        ? doctorsData
        : Array.isArray(doctorsData?.data)
          ? doctorsData.data
          : [];

      const doctorLookup = doctors.reduce((accumulator, doctor) => {
        if (doctor?._id) {
          accumulator[doctor._id] = doctor;
        }
        return accumulator;
      }, {});

      const appointmentsByDoctor = await Promise.all(
        doctors.map(async (doctor) => {
          const res = await fetch(`/api/appointments/doctor/${encodeURIComponent(doctor._id)}`, { headers });
          const data = await res.json().catch(() => []);
          if (!res.ok) {
            throw new Error(data?.message || `Failed to load appointments for ${doctor.name || doctor._id}.`);
          }
          return Array.isArray(data) ? data : [];
        })
      );

      const flattenedAppointments = appointmentsByDoctor.flat();
      const uniqueAppointments = flattenedAppointments.filter(
        (appointment, index, array) => array.findIndex((item) => item?._id === appointment?._id) === index
      );

      const patientIds = [...new Set(uniqueAppointments.map((appointment) => appointment?.patientId).filter(Boolean))];
      const patientEntries = await Promise.all(
        patientIds.map(async (patientId) => {
          const res = await fetch(`/api/patients/doctor-view/${encodeURIComponent(patientId)}/profile`, { headers });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            return [patientId, null];
          }
          return [patientId, data];
        })
      );

      const patientLookup = Object.fromEntries(patientEntries);

      const enriched = uniqueAppointments.map((appointment) => {
        const doctor = doctorLookup[appointment?.doctorId] || null;
        const patient = patientLookup[appointment?.patientId] || null;

        return {
          id: appointment?._id || "-",
          appointment,
          patient,
          doctor,
          patientId: appointment?.patientId || "-",
          doctorId: appointment?.doctorId || "-",
          patientName: patient?.fullName || appointment?.patientId || "Unknown patient",
          patientEmail: patient?.email || "-",
          patientPhone: patient?.phone || "-",
          patientGender: patient?.gender || "-",
          patientBloodGroup: patient?.bloodGroup || "-",
          patientAddress: patient?.address || "-",
          doctorName: doctor?.name || appointment?.doctorId || "Unknown doctor",
          doctorEmail: doctor?.email || "-",
          doctorPhone: doctor?.phone || "-",
          doctorSpecialization: doctor?.specialization || "-",
          doctorExperience: doctor?.experience ?? "-",
          doctorHospital: doctor?.hospital || "-",
          doctorLicenseNumber: doctor?.licenseNumber || "-",
          doctorVerificationStatus: doctor?.verificationStatus || "-",
          dateValue: appointment?.date ? new Date(appointment.date) : null,
          time: appointment?.time || "-",
          status: appointment?.status || "-",
          meetingLink: appointment?.meetingLink || "",
          notes: appointment?.notes || ""
        };
      });

      enriched.sort((left, right) => {
        const leftTime = left?.dateValue ? left.dateValue.getTime() : 0;
        const rightTime = right?.dateValue ? right.dateValue.getTime() : 0;
        return rightTime - leftTime;
      });

      setDoctorMap(doctorLookup);
      setAppointments(enriched);
    } catch (err) {
      setError(err?.message || "Failed to load appointments.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((appointment) => appointment?.status === "Pending").length;
    const confirmed = appointments.filter((appointment) => appointment?.status === "Confirmed").length;
    const completed = appointments.filter((appointment) => appointment?.status === "Completed").length;
    const cancelled = appointments.filter((appointment) => appointment?.status === "Cancelled").length;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      doctors: Object.keys(doctorMap).length,
      patients: new Set(appointments.map((appointment) => appointment?.appointment?.patientId).filter(Boolean)).size
    };
  }, [appointments, doctorMap]);

  const rows = useMemo(() => {
    return appointments.map((appointment) => {
      const dateText = formatDateText(appointment?.dateValue);
      const timeText = formatTimeText(appointment?.dateValue, appointment?.time || "-");

      return {
        ...appointment,
        dateText,
        timeText,
        searchText: [
          appointment?.id,
          appointment?.patientId,
          appointment?.doctorId,
          appointment?.patientName,
          appointment?.patientEmail,
          appointment?.doctorName,
          appointment?.doctorEmail,
          appointment?.doctorSpecialization,
          appointment?.status
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
      };
    });
  }, [appointments]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery = !query || row.searchText.includes(query);
      const matchesStatus = !statusFilter || row.status === statusFilter;
      const matchesDoctor = !doctorFilter || row.doctorName.toLowerCase().includes(doctorFilter.toLowerCase());
      const matchesPatient = !patientFilter || row.patientName.toLowerCase().includes(patientFilter.toLowerCase());

      return matchesQuery && matchesStatus && matchesDoctor && matchesPatient;
    });
  }, [rows, searchQuery, statusFilter, doctorFilter, patientFilter]);

  const exportReport = () => {
    const escapeCsv = (value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return `"${text.replaceAll('"', '""')}"`;
    };

    const summaryRows = [
      ["Metric", "Value"],
      ["Total Appointments", stats.total],
      ["Pending", stats.pending],
      ["Confirmed", stats.confirmed],
      ["Completed", stats.completed],
      ["Cancelled", stats.cancelled],
      ["Unique Patients", stats.patients],
      ["Unique Doctors", stats.doctors]
    ];

    const exportRows = filteredRows.map((row) => ({
      AppointmentID: row.id,
      AppointmentDate: row.dateText,
      AppointmentTime: row.timeText,
      Status: row.status,
      PatientName: row.patientName,
      PatientId: row.patientId,
      PatientEmail: row.patientEmail,
      PatientPhone: row.patientPhone,
      PatientGender: row.patientGender,
      PatientBloodGroup: row.patientBloodGroup,
      PatientAddress: row.patientAddress,
      DoctorName: row.doctorName,
      DoctorId: row.doctorId,
      DoctorEmail: row.doctorEmail,
      DoctorPhone: row.doctorPhone,
      DoctorSpecialization: row.doctorSpecialization,
      DoctorExperience: row.doctorExperience,
      DoctorHospital: row.doctorHospital,
      DoctorLicenseNumber: row.doctorLicenseNumber,
      DoctorVerificationStatus: row.doctorVerificationStatus,
      MeetingLink: row.meetingLink,
      Notes: row.notes
    }));

    const reportHeaders = Object.keys(exportRows[0] || {
      AppointmentID: "", AppointmentDate: "", AppointmentTime: "", Status: "",
      PatientName: "", PatientId: "", PatientEmail: "", PatientPhone: "",
      PatientGender: "", PatientBloodGroup: "", PatientAddress: "",
      DoctorName: "", DoctorId: "", DoctorEmail: "", DoctorPhone: "",
      DoctorSpecialization: "", DoctorExperience: "", DoctorHospital: "",
      DoctorLicenseNumber: "", DoctorVerificationStatus: "", MeetingLink: "", Notes: ""
    });

    const csvSections = [
      ["Appointment Summary"],
      summaryRows.map((row) => row.map(escapeCsv).join(",")),
      [],
      ["Appointment Details"],
      [reportHeaders.map(escapeCsv).join(",")],
      exportRows.map((row) => reportHeaders.map((header) => escapeCsv(row[header])).join(","))
    ];

    const csvContent = csvSections.flat().join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-appointments-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_24px_80px_-50px_rgba(15,23,42,0.45)]">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative p-6 sm:p-8 xl:p-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700">
                  Appointments Hub
                </div>
                <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  Monitor bookings with a cleaner, more premium workspace.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Review appointments, spot pending sessions, export reports, and jump into meetings without digging through a plain table.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={loadAppointments}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
                  >
                    <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync data
                  </button>
                  <button
                    onClick={exportReport}
                    disabled={filteredRows.length === 0}
                    className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#0070cd] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-30px_rgba(0,112,205,0.6)] transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 ${filteredRows.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium text-red-800">{error}</span>
              </div>
            </div>
          )}

          <section className="mt-8 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Filters</div>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">Appointment directory</h2>
                  <p className="mt-1 text-sm text-slate-600">Search by patient, doctor, status, or appointment ID.</p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {filteredRows.length} visible
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_0.8fr_0.8fr]">
                <div className="xl:col-span-1">
                  <label htmlFor="search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">Search Appointments</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      id="search"
                      type="text"
                      className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:text-sm"
                      placeholder="Search by ID, name, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">Status</label>
                  <select
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">Doctor</label>
                  <input
                    type="text"
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:text-sm"
                    placeholder="Doctor name..."
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{filteredRows.length}</span> of <span className="font-semibold text-slate-900">{rows.length}</span> results
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("");
                    setDoctorFilter("");
                    setPatientFilter("");
                  }}
                  className="text-sm font-semibold text-blue-700 transition hover:text-blue-800 hover:underline"
                >
                  Clear all filters
                </button>
              </div>

              {loading && appointments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                  <svg className="mx-auto h-10 w-10 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="mt-4 text-sm font-semibold text-slate-500">Loading appointments...</div>
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-slate-500">
                  <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-4 text-base font-semibold text-slate-700">No appointments found</p>
                  <p className="mt-1 text-sm">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-200">
                  <table className="min-w-7xl w-full divide-y divide-slate-200 bg-white">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr>
                        <th scope="col" className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.22em] text-slate-600">Appointment</th>
                        <th scope="col" className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.22em] text-slate-600">Patient Details</th>
                        <th scope="col" className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.22em] text-slate-600">Doctor Details</th>
                        <th scope="col" className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.22em] text-slate-600">Status</th>
                        <th scope="col" className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.22em] text-slate-600">Meeting</th>
                        <th scope="col" className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.22em] text-slate-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredRows.map((row) => {
                        const statusMeta = getStatusMeta(row.status);

                        return (
                          <tr key={row.id} className="transition hover:bg-slate-50/70">
                            <td className="px-5 py-5 align-top">
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
                                  <span className="text-sm font-black text-blue-700">{row.dateValue ? row.dateValue.getDate() : "-"}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{row.dateText}</div>
                                  <div className="mt-1 text-xs text-slate-500">{row.timeText}</div>
                                  <div className="mt-2 text-xs font-mono tracking-tight text-slate-400" title={row.id}>ID: {row.id.substring(0, 8)}...</div>
                                </div>
                              </div>
                              <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{getAppointmentType(row)}</div>
                            </td>

                            <td className="px-5 py-5 align-top">
                              <div className="text-sm font-bold text-slate-900">{row.patientName}</div>
                              <div className="mt-1 text-xs text-slate-500">{row.patientEmail !== "-" ? row.patientEmail : row.patientPhone}</div>
                              <div className="mt-1 text-xs text-slate-500">{row.patientGender !== "-" ? `Gender: ${row.patientGender}` : "Gender not provided"}</div>
                              <div className="mt-1 text-xs text-slate-500">{row.patientAddress !== "-" ? row.patientAddress : "Address not provided"}</div>
                              {row.patientBloodGroup !== "-" && (
                                <div className="mt-3 inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">Blood: {row.patientBloodGroup}</div>
                              )}
                            </td>

                            <td className="px-5 py-5 align-top">
                              <div className="text-sm font-bold text-slate-900">{row.doctorName}</div>
                              <div className="mt-1 text-xs text-slate-500">{row.doctorSpecialization}</div>
                              <div className="mt-1 text-xs text-slate-500">{row.doctorHospital}</div>
                              <div className="mt-1 text-xs text-slate-500">{row.doctorEmail !== "-" ? row.doctorEmail : row.doctorPhone}</div>
                              <div className="mt-1 text-xs text-slate-500">License: {row.doctorLicenseNumber}</div>
                              <div className="mt-1 text-xs text-slate-500">Experience: {row.doctorExperience}</div>
                            </td>

                            <td className="px-5 py-5 align-top">
                              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                                <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                                {statusMeta.label}
                              </div>
                              <div className="mt-3 text-xs text-slate-500">Doctor status: <span className="font-semibold text-slate-700">{row.doctorVerificationStatus}</span></div>
                            </td>

                            <td className="px-5 py-5 align-top">
                              {row.meetingLink && row.status !== "Cancelled" ? (
                                <a
                                  href={row.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 hover:text-blue-800"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Join Meeting
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
                                  {row.status === "Cancelled" ? "Meeting unavailable" : "No meeting link"}
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-5 align-top">
                              {row.notes ? (
                                <div className="max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                                  {row.notes}
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">No notes</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, icon, bg, ring }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-300">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ring-1 ${ring}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">{value}</p>
        </div>
      </div>
    </div>
  );
}
