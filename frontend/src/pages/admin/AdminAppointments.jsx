import { useEffect, useMemo, useState } from "react";
import { getToken } from "../../utils/auth";
import MainLayout from "../../layouts/MainLayout";

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
      const dateText = appointment?.dateValue && !Number.isNaN(appointment.dateValue.getTime())
        ? appointment.dateValue.toLocaleDateString()
        : "-";

      const timeText = appointment?.dateValue && !Number.isNaN(appointment.dateValue.getTime())
        ? appointment.dateValue.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : appointment?.time || "-";

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
      AppointmentID: "",
      AppointmentDate: "",
      AppointmentTime: "",
      Status: "",
      PatientName: "",
      PatientId: "",
      PatientEmail: "",
      PatientPhone: "",
      PatientGender: "",
      PatientBloodGroup: "",
      PatientAddress: "",
      DoctorName: "",
      DoctorId: "",
      DoctorEmail: "",
      DoctorPhone: "",
      DoctorSpecialization: "",
      DoctorExperience: "",
      DoctorHospital: "",
      DoctorLicenseNumber: "",
      DoctorVerificationStatus: "",
      MeetingLink: "",
      Notes: ""
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

  const statusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-32">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Appointments</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              A unified appointments report built from the live appointment service and enriched with patient and doctor profile data.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadAppointments}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              onClick={exportReport}
              disabled={filteredRows.length === 0}
              className={`rounded-xl bg-[#0070cd] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 ${
                filteredRows.length === 0 ? "cursor-not-allowed opacity-60" : ""
              }`}
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Appointments" value={stats.total} accent="blue" />
          <StatCard label="Pending" value={stats.pending} accent="amber" />
          <StatCard label="Confirmed" value={stats.confirmed} accent="emerald" />
          <StatCard label="Completed" value={stats.completed} accent="slate" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Cancelled" value={stats.cancelled} accent="rose" />
          <StatCard label="Patients" value={stats.patients} accent="indigo" />
          <StatCard label="Doctors" value={stats.doctors} accent="cyan" />
          <StatCard label="Visible Rows" value={filteredRows.length} accent="violet" />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-800">Search</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search appointment id, patient, doctor, specialization, or status"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Patient</label>
              <input
                value={patientFilter}
                onChange={(event) => setPatientFilter(event.target.value)}
                placeholder="Patient name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Doctor</label>
              <input
                value={doctorFilter}
                onChange={(event) => setDoctorFilter(event.target.value)}
                placeholder="Doctor name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0070cd] focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredRows.length}</span> of <span className="font-semibold text-slate-900">{rows.length}</span> appointments.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
                setDoctorFilter("");
                setPatientFilter("");
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Appointment Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-6 py-4">Appointment</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Meeting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="align-top text-slate-700 transition hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <div className="font-mono text-xs font-semibold text-slate-900">{row.id}</div>
                      <div className="mt-2 text-xs text-slate-500">{row.notes || "No notes"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-900">{row.patientName}</div>
                      <div className="mt-1 font-mono text-xs text-slate-500">ID: {row.patientId}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.patientEmail}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.patientPhone}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Blood group:</span> {row.patientBloodGroup}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-900">{row.doctorName}</div>
                      <div className="mt-1 font-mono text-xs text-slate-500">ID: {row.doctorId}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.doctorSpecialization}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.doctorEmail}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Hospital:</span> {row.doctorHospital}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-slate-900">{row.dateText}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.timeText}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {row.meetingLink ? (
                        <a className="font-semibold text-[#0070cd] hover:underline" href={row.meetingLink} target="_blank" rel="noreferrer">
                          Open Link
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                      {appointments.length === 0
                        ? "No appointments found."
                        : "No appointments match the current filters."}
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading appointment report...
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, accent = "slate" }) {
  const palette = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700"
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${palette[accent] || palette.slate}`}>
          Live
        </div>
      </div>
    </div>
  );
}
