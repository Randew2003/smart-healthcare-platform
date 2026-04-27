import { useEffect, useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getToken } from "../../utils/auth";
import AOS from "aos";
import "aos/dist/aos.css";

export default function PendingDoctors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [busy, setBusy] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const getHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const loadPending = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("Admin token missing. Please login again.");
        setDoctors([]);
        return;
      }

      const res = await fetch("/api/admin/doctors/pending", { headers: getHeaders() });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load pending doctors.");
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load pending doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-out-quart",
      once: true,
      offset: 50
    });
    loadPending();
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchSearch =
        (d?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d?.doctorApplication?.specialization || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [doctors, searchTerm]);

  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctors.find((d) => d?._id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  const setDoctorBusy = (id, value) => {
    setBusy((prev) => ({ ...prev, [id]: value }));
  };

  const verify = async (id, status) => {
    setError("");
    setDoctorBusy(id, true);
    try {
      const res = await fetch(`/api/admin/doctors/${encodeURIComponent(id)}/verify`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update doctor status.");
      
      setDoctors((prev) => prev.filter((d) => d?._id !== id));
      if (selectedDoctorId === id) {
        setSelectedDoctorId(null);
      }
    } catch (err) {
      setError(err?.message || "Failed to update doctor status.");
    } finally {
      setDoctorBusy(id, false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        
        {/* Hero Header Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 to-orange-500 p-8 text-white shadow-xl shadow-orange-900/20" data-aos="fade-down">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">Pending Approvals</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-orange-100 sm:text-base leading-relaxed">
                Review and verify incoming physician applications. Carefully audit medical licenses, specializations, and uploaded documents before granting system access.
              </p>
            </div>
            <button
              onClick={loadPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 border border-white/20"
            >
              <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Queue
            </button>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-300 opacity-20 blur-3xl"></div>
          <img src="/adminassets/admindashboard-pic (2).png" alt="Doctors Background" className="absolute right-0 top-0 h-full opacity-10 object-cover mix-blend-overlay grayscale" />
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm px-6 py-5 flex items-center gap-4 text-sm font-medium text-red-700 shadow-lg shadow-red-500/10" data-aos="fade-in">
             <svg className="h-6 w-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 flex flex-col h-[700px]" data-aos="fade-up" data-aos-delay="100">
          
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Application Queue</h2>
              <div className="ml-3 hidden sm:flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm border border-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{filteredDoctors.length}</span>
              </div>
            </div>

            <div className="relative w-full sm:w-[320px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, email or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-400 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1 p-0">
            <table className="w-full min-w-full text-left text-sm whitespace-nowrap relative">
              <thead className="sticky top-0 z-10 bg-[#fefaf6] text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500 border-b border-slate-200 shadow-sm">
                <tr>
                  <th className="px-6 sm:px-8 py-5">Physician Details</th>
                  <th className="px-6 py-5">Specialization & License</th>
                  <th className="px-6 py-5 text-right w-48">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white">
                {filteredDoctors.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-32 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-slate-400">
                        <svg className="mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-lg font-bold text-slate-700">Queue is empty</p>
                        <p className="mt-1 text-sm text-slate-500">There are no pending doctor applications matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-32 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-r-2 border-orange-500"></div>
                        <span className="font-medium animate-pulse">Scanning application queue...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredDoctors.map((d) => {
                  const id = d?._id;
                  const isBusy = !!busy[id];
                  const application = d?.doctorApplication || {};
                  
                  return (
                    <tr key={id} className="text-slate-700 transition-all hover:bg-orange-50/30 group">
                      <td className="px-6 sm:px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-orange-700 border border-orange-200 shadow-inner font-bold uppercase">
                            {d?.fullName?.charAt(0) || "D"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                              {d?.fullName || "Unnamed Doctor"}
                            </div>
                            <div className="text-slate-500 text-xs mt-0.5 font-medium">{d?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-800">{application?.specialization || "Unspecified Specialty"}</span>
                            <span className="text-xs font-mono text-slate-500">License: {application?.licenseNumber || "Pending"}</span>
                         </div>
                      </td>
                      <td className="px-6 sm:px-8 py-5 text-right align-middle">
                         <button
                            onClick={() => setSelectedDoctorId(id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 active:scale-95"
                          >
                            Review Request
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                          </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Modal for Doctor Details & Approval */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 pt-[5%] backdrop-blur-sm sm:p-6" data-aos="fade-in">
             <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/50 ring-1 ring-slate-900/10">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white/90 px-8 py-6 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-bold text-xl text-orange-600">
                      {selectedDoctor?.fullName?.charAt(0) || "D"}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">Application Review</h2>
                      <p className="mt-0.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Awaiting Admin Verification</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoctorId(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="overflow-y-auto p-8">
                  <div className="grid gap-8 lg:grid-cols-2">
                    
                    {/* Left Column: Personal Context */}
                    <div className="flex flex-col gap-6">
                       <div>
                          <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Identity Information</h3>
                          <div className="grid gap-5">
                             <Detail label="Full Name" value={selectedDoctor?.fullName} />
                             <Detail label="Email Address" value={selectedDoctor?.email} />
                             <Detail label="Phone Number" value={selectedDoctor?.phone || "-"} />
                          </div>
                       </div>
                    </div>

                    {/* Right Column: Professional Details */}
                    <div className="flex flex-col gap-6">
                       <div>
                          <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Professional Profile</h3>
                          <div className="grid gap-5 sm:grid-cols-2">
                             <Detail label="Specialization" value={selectedDoctor?.doctorApplication?.specialization} />
                             <Detail label="Medical License" value={selectedDoctor?.doctorApplication?.licenseNumber} mono />
                             <Detail label="Primary Clinic" value={selectedDoctor?.doctorApplication?.clinicName} />
                             <Detail label="Experience" value={selectedDoctor?.doctorApplication?.yearsExperience ? `${selectedDoctor?.doctorApplication?.yearsExperience} Years` : "-"} />
                          </div>
                          
                          <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4 mt-8 border-b border-slate-100 pb-2">Attached Documents</h3>
                          <div className="grid gap-5 sm:grid-cols-2">
                             <Detail label="ID Proof" value={selectedDoctor?.doctorApplication?.idProofFileName} mono />
                             <Detail label="Medical Certificate" value={selectedDoctor?.doctorApplication?.medicalCertificateFileName} mono />
                          </div>
                          <div className="mt-4 rounded-xl bg-orange-50/80 p-4 border border-orange-100 text-[11px] font-bold uppercase tracking-widest text-orange-600 flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Physical document verification required prior to approval.
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer / Actions */}
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:px-8 flex flex-col sm:flex-row items-center gap-4 justify-end">
                   <p className="text-xs font-medium text-slate-500 w-full sm:w-auto sm:mr-auto">Action cannot be easily undone.</p>
                   
                   <button
                      disabled={!!busy[selectedDoctor?._id]}
                      onClick={() => verify(selectedDoctor?._id, "rejected")}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 focus:ring-4 focus:ring-red-100 ${!!busy[selectedDoctor?._id] ? "cursor-wait opacity-60" : "active:scale-95"}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Reject Application
                    </button>

                   <button
                      disabled={!!busy[selectedDoctor?._id]}
                      onClick={() => verify(selectedDoctor?._id, "verified")}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/40 focus:ring-4 focus:ring-emerald-100 ${!!busy[selectedDoctor?._id] ? "cursor-wait opacity-60" : "active:scale-95"}`}
                    >
                      {!!busy[selectedDoctor?._id] ? (
                         <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      ) : (
                         <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      )}
                      Approve & Verify Provider
                    </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-800">{value}</div>
    </div>
  );
}
