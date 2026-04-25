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

      return (
        name.includes(q) ||
        specialization.includes(q) ||
        clinic.includes(q)
      );
    });
  }, [doctors, query]);

  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        <div className="w-full overflow-hidden bg-white">
          <img
            src={doctorsBanner}
            alt="Doctors Banner"
            className="h-[260px] w-full object-cover sm:h-[320px] lg:h-[380px]"
          />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                Our Doctors
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2459A6] sm:text-4xl">
                Choose A Specialist For Your Healthcare Needs
              </h2>
            </div>

            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              Search trusted medical professionals by name, specialty, clinic,
              or hospital and book your appointment easily.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-[#D8EAF6] bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#2459A6]">
                  Search doctors
                </label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctor, specialization, clinic..."
                  className="h-11 w-full rounded-md border border-slate-200 bg-[#F6FAFD] px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2477B8] focus:bg-white focus:ring-2 focus:ring-[#2477B8]/15"
                />
              </div>

              <div className="rounded-xl border border-[#D8EAF6] bg-[#EAF6FF] px-5 py-3 text-sm">
                <p className="font-semibold text-[#2459A6]">
                  {filtered.length} Doctors Found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Search result count
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-10 rounded-2xl border border-[#D8EAF6] bg-white px-6 py-14 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Loading doctors...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-[#D8EAF6] bg-white px-6 py-14 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-[#2459A6]">
                No doctors found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try another doctor name, specialty, clinic, or hospital.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  "Clinic information not available";
                const email = doctor?.email || "Email not available";
                const phone = doctor?.phone || "Phone not available";
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
                  <div
                    key={id || doctor?.email || name}
                    className="overflow-hidden rounded-2xl border border-[#D8EAF6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="bg-gradient-to-r from-[#2459A6] to-[#2477B8] px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-2xl font-bold text-[#2477B8]">
                          {name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-white">
                            {name}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-white/85">
                            {specialization}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-md bg-[#35B85A]/10 px-3 py-1 text-xs font-semibold text-[#23823d]">
                          Available
                        </span>
                        <span className="rounded-md bg-[#EAF6FF] px-3 py-1 text-xs font-semibold text-[#2477B8]">
                          Appointment
                        </span>
                      </div>

                      <p className="text-sm font-medium text-slate-500">
                        Clinic / Hospital
                      </p>
                      <p className="mt-1 min-h-[24px] text-sm font-semibold text-slate-700">
                        {clinic}
                      </p>

                      <p className="mt-4 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
                        {doctor?.bio ||
                          "Consult this doctor for professional healthcare advice and appointment-based medical support."}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#F6FAFD] p-3">
                          <p className="text-[11px] font-semibold uppercase text-slate-400">
                            Experience
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#2459A6]">
                            {experience}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#F6FAFD] p-3">
                          <p className="text-[11px] font-semibold uppercase text-slate-400">
                            Fee
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#2459A6]">
                            {fee ? `LKR ${fee}` : "At booking"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2 border-t border-[#D8EAF6] pt-4">
                        <p className="truncate text-sm text-slate-600">
                          <span className="font-semibold text-slate-700">
                            Email:
                          </span>{" "}
                          {email}
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-700">
                            Phone:
                          </span>{" "}
                          {phone}
                        </p>
                      </div>

                      <Link
                        to={`/book-appointment?doctorId=${encodeURIComponent(
                          id
                        )}`}
                        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#2477B8] text-sm font-semibold text-white transition hover:bg-[#2459A6]"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}