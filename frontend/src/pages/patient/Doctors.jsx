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

        const doctorList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.doctors)
          ? data.doctors
          : [];

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;

    return doctors.filter((doctor) => {
      const name = String(doctor?.name || doctor?.fullName || "").toLowerCase();
      const specialization = String(
        doctor?.specialization || doctor?.speciality || ""
      ).toLowerCase();
      const clinic = String(
        doctor?.clinicName || doctor?.hospital || ""
      ).toLowerCase();

      return name.includes(q) || specialization.includes(q) || clinic.includes(q);
    });
  }, [doctors, query]);

  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        <div className="w-full overflow-hidden bg-white">
          <img
            src={doctorsBanner}
            alt="Doctors Banner"
            className="h-[220px] w-full object-cover sm:h-[280px] lg:h-[330px]"
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="rounded-2xl border border-[#D8EAF6] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#35B85A]">
                  Our Doctors
                </p>
                <h1 className="mt-1 text-2xl font-bold text-[#2459A6]">
                  Find Your Doctor
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Search and book an appointment with a specialist.
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctor or specialty..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-[#F6FAFD] px-4 text-sm outline-none focus:border-[#2477B8] focus:bg-white"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {filtered.length} doctor{filtered.length === 1 ? "" : "s"} found
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-6 rounded-2xl border border-[#D8EAF6] bg-white p-10 text-center text-sm text-slate-500">
              Loading doctors...
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#D8EAF6] bg-white p-10 text-center">
              <h3 className="text-lg font-bold text-[#2459A6]">
                No doctors found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try another doctor name or specialty.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((doctor) => {
                const id = doctor?._id || doctor?.id || "";
                const name = doctor?.name || doctor?.fullName || "Doctor";
                const specialization =
                  doctor?.specialization ||
                  doctor?.speciality ||
                  "Medical Specialist";
                const clinic =
                  doctor?.clinicName ||
                  doctor?.hospital ||
                  "Clinic not available";
                const experience =
                  doctor?.experience ||
                  doctor?.yearsOfExperience ||
                  "Available";
                const fee =
                  doctor?.fee ||
                  doctor?.consultationFee ||
                  doctor?.appointmentFee ||
                  null;

                return (
                  <article
                    key={id || doctor?.email || name}
                    className="rounded-2xl border border-[#D8EAF6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative mt-1 flex h-4 w-4 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#35B85A] opacity-60" />
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-[#35B85A] shadow-[0_0_14px_rgba(53,184,90,0.9)]" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-slate-900">
                          Dr. {name.replace(/^Dr\.?\s*/i, "")}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-[#35B85A]">
                          {specialization}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Clinic / Hospital
                        </p>
                        <p className="mt-1 font-medium text-slate-700">
                          {clinic}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#F6FAFD] p-3">
                          <p className="text-xs font-semibold text-slate-400">
                            Experience
                          </p>
                          <p className="mt-1 font-bold text-[#2459A6]">
                            {experience}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#F6FAFD] p-3">
                          <p className="text-xs font-semibold text-slate-400">
                            Fee
                          </p>
                          <p className="mt-1 font-bold text-[#2459A6]">
                            {fee ? `LKR ${fee}` : "At booking"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/book-appointment?doctorId=${encodeURIComponent(id)}`}
                      className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2459A6] text-sm font-semibold text-white transition hover:bg-[#1d4a8a]"
                    >
                      Book Appointment
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}