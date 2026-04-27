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
        ? appointment.dateValue.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
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

  const getStatusDisplay = (status) => {
    switch (status) {
      case "Completed":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Completed</span>;
      case "Confirmed":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>Confirmed</span>;
      case "Cancelled":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10"><div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20"><div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>Pending</span>;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Appointments Hub</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Manage and monitor all platform appointments in real-time
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={loadAppointments}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync
              </button>
              <button
                onClick={exportReport}
                disabled={filteredRows.length === 0}
                className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#0070cd] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${filteredRows.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Bookings" value={stats.total} icon={<svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} bg="bg-indigo-50" ring="ring-indigo-100" />
            <StatCard label="Pending Approval" value={stats.pending} icon={<svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} bg="bg-amber-50" ring="ring-amber-100" />
            <StatCard label="Completed Sessions" value={stats.completed} icon={<svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} bg="bg-emerald-50" ring="ring-emerald-100" />
            <StatCard label="Active Doctors" value={stats.doctors} icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} bg="bg-blue-50" ring="ring-blue-100" />
          </div>

          {/* Main Card */}
          <div className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* Filters Section */}
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <label htmlFor="search" className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">Search Appointments</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      id="search"
                      type="text"
                      className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#0070cd] sm:text-sm sm:leading-6"
                      placeholder="Search by ID, name, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</label>
                  <select
                    className="block w-full rounded-xl border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#0070cd] sm:text-sm sm:leading-6"
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

                <div className="w-full md:w-48">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">Doctor</label>
                  <input
                    type="text"
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#0070cd] sm:text-sm sm:leading-6"
                    placeholder="Doctor name..."
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-[#f8fafc]">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Appointment Details</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient Info</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Doctor Info</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status & Meet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading && appointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="h-8 w-8 animate-spin text-[#0070cd] mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm font-medium text-slate-500">Loading appointments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-base font-medium">No appointments found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                              <span className="text-sm font-bold text-[#0070cd]">{row.dateValue ? row.dateValue.getDate() : '-'}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{row.dateText}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {row.timeText}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-slate-400 font-mono tracking-tight" title={row.id}>ID: {row.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm shrink-0">
                              {row.patientName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{row.patientName}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{row.patientEmail !== "-" ? row.patientEmail : row.patientPhone}</div>
                            </div>
                          </div>
                          {row.patientBloodGroup !== "-" && (
                             <div className="mt-2 text-xs font-medium text-rose-600 bg-rose-50 inline-block px-1.5 py-0.5 rounded">Blood: {row.patientBloodGroup}</div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm shrink-0">
                              Dr
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{row.doctorName}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{row.doctorSpecialization}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="flex flex-col items-start gap-2">
                            {getStatusDisplay(row.status)}
                            {row.meetingLink && row.status !== "Cancelled" && (
                              <a
                                href={row.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0070cd] hover:text-blue-800 transition-colors bg-blue-50/50 hover:bg-blue-100 px-2 py-1 rounded-md"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Join Meeting
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination / Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-2xl flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900">{filteredRows.length}</span> of <span className="font-semibold text-slate-900">{rows.length}</span> results
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                  setDoctorFilter("");
                }}
                className="text-sm font-medium text-[#0070cd] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, icon, bg, ring }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-slate-300`}>
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
