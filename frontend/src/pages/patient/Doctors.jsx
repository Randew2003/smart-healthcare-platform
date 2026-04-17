import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import doctorsBanner from "../../assets/patientassets/doctors.png";

export default function Doctors() {
  const [query, setQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/doctors");
        const data = await res.json();

        let doctorList = [];
        if (Array.isArray(data)) doctorList = data;
        else if (Array.isArray(data?.data)) doctorList = data.data;
        else if (Array.isArray(data?.doctors)) doctorList = data.doctors;

        setDoctors(Array.isArray(doctorList) ? doctorList : []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors.");
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const filtered = useMemo(() => {
    const list = Array.isArray(doctors) ? doctors : [];
    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter((doctor) => {
      const name = String(doctor?.name || doctor?.fullName || "").toLowerCase();
      const specialization = String(doctor?.specialization || doctor?.speciality || "").toLowerCase();
      const clinic = String(doctor?.clinicName || doctor?.hospital || "").toLowerCase();
      return name.includes(q) || specialization.includes(q) || clinic.includes(q);
    });
  }, [doctors, query]);

  return (
    <MainLayout>
      <section className="bg-[#f5fbff]">
        <div className="w-full overflow-hidden">
          <div className="h-[220px] sm:h-[260px] lg:h-[300px]">
            <img src={doctorsBanner} alt="Doctors Banner" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">Medical Specialists</p>
            <h1 className="mt-3 text-3xl font-extrabold text-[#02539d] sm:text-4xl">Find the Right Doctor for You</h1>
            <p className="mt-3 text-sm text-slate-600">
              Browse our experienced doctors and choose the best specialist for your healthcare needs.
            </p>
          </div>

          <div className="mt-8">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctor, specialization, clinic..."
              className="h-12 w-full rounded-xl border border-[#cfe3f3] px-4 text-sm outline-none focus:border-[#00bbb3] focus:ring-2 focus:ring-[#00bbb3]/20"
            />
          </div>

          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-10 rounded-xl border border-[#d9edf9] bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
              Loading doctors...
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 rounded-xl border border-[#d9edf9] bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
              No doctors available.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((doctor) => (
                <div
                  key={doctor?._id || doctor?.id || doctor?.email}
                  className="rounded-[20px] border border-[#d9edf9] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <h3 className="text-lg font-extrabold text-[#02539d]">{doctor?.name || doctor?.fullName || "Doctor"}</h3>
                    <p className="mt-1 text-sm font-bold text-[#00bbb3]">
                      {doctor?.specialization || doctor?.speciality || "Specialist"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {doctor?.clinicName || doctor?.hospital || "Clinic information not available"}
                    </p>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    {doctor?.bio || "Book an appointment to consult with this doctor."}
                  </p>

                  <div className="mt-5">
                    <Link
                      to={`/book-appointment?doctorId=${encodeURIComponent(doctor?._id || doctor?.id || "")}`}
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#0070cd] text-sm font-bold text-white hover:bg-[#02539d]"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}