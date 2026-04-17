import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import doctorsBanner from "../../assets/patientassets/doctors.png";

export default function Doctors() {
  const [query, setQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Fetch doctors from backend
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/doctors"); // 🔸 change if needed
        const data = await res.json();

        // ✅ Ensure always array
        let doctorList = [];

        if (Array.isArray(data)) {
          doctorList = data;
        } else if (Array.isArray(data?.data)) {
          doctorList = data.data;
        } else if (Array.isArray(data?.doctors)) {
          doctorList = data.doctors;
        }

        setDoctors(doctorList);
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

  // 🔹 Filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;

    return doctors.filter((doctor) => {
      return (
        doctor?.name?.toLowerCase().includes(q) ||
        doctor?.specialization?.toLowerCase().includes(q) ||
        doctor?.clinicName?.toLowerCase().includes(q)
      );
    });
  }, [query, doctors]);

  return (
    <MainLayout>
      <section className="bg-[#f5fbff]">

        {/* 🔹 Banner */}
        <div className="w-full overflow-hidden">
          <div className="h-[220px] sm:h-[260px] lg:h-[300px]">
            <img
              src={doctorsBanner}
              alt="Doctors Banner"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

          {/* 🔹 Intro */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">
              Medical Specialists
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-[#02539d] sm:text-4xl">
              Find the Right Doctor for You
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Browse our experienced doctors and choose the best specialist for your healthcare needs.
            </p>
          </div>

          {/* 🔹 Search */}
          <div className="mt-8">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctor, specialization, clinic..."
              className="h-12 w-full rounded-xl border border-[#cfe3f3] px-4 text-sm outline-none focus:border-[#00bbb3] focus:ring-2 focus:ring-[#00bbb3]/20"
            />
          </div>

          {/* 🔹 Error */}
          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* 🔹 Content */}
          {loading ? (
            <div className="mt-10 text-center text-sm text-slate-500">
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
                  key={doctor?._id || doctor?.id}
                  className="rounded-[20px] border border-[#d9edf9] bg-white p-6 shadow-sm hover:shadow-md"
                >
                  <h3 className="text-lg font-extrabold text-[#02539d]">
                    {doctor?.name}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-[#00bbb3]">
                    {doctor?.specialization}
                  </p>

                  <p className="text-sm text-slate-500">
                    {doctor?.clinicName}
                  </p>

                  <p className="mt-4 text-sm text-slate-600">
                    {doctor?.bio || "Doctor information not available."}
                  </p>

                  <div className="mt-5">
                    <Link
                      to={`/appointments?doctorId=${doctor?._id}`}
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