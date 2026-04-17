import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";

export default function Doctors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/doctors/verified");
      const list = Array.isArray(data) ? data : data?.data;
      setDoctors(Array.isArray(list) ? list : []);
    } catch (err) {
      setDoctors([]);
      setError(err?.response?.data?.message || "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) => {
      const name = String(d?.name || d?.fullName || "").toLowerCase();
      const spec = String(d?.specialization || "").toLowerCase();
      const clinic = String(d?.clinicName || "").toLowerCase();
      return name.includes(q) || spec.includes(q) || clinic.includes(q);
    });
  }, [doctors, query]);

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-[170px]">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Doctors</h1>
              <p className="mt-1 text-sm text-slate-600">
                Browse verified doctors and book your appointment.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={load}
                className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14]"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, specialization, clinic..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20"
              />
            </div>
            <div className="flex items-end">
              <Link
                to="/appointments"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421]"
              >
                Go to Appointments
              </Link>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            {loading ? (
              <div className="text-sm text-slate-600">Loading doctors...</div>
            ) : null}

            {!loading && filtered.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No doctors found.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((d) => (
                <div
                  key={d._id}
                  className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-black text-slate-900">
                        {d?.name || d?.fullName || "Doctor"}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-600">
                        {d?.specialization || "General"}
                      </div>
                      {d?.clinicName ? (
                        <div className="mt-1 text-xs text-slate-500">Clinic: {d.clinicName}</div>
                      ) : null}
                    </div>

                    <div className="rounded-full border border-[#fbb033]/35 bg-[#fbb033]/15 px-3 py-1 text-xs font-extrabold text-[#7a4d00]">
                      Verified
                    </div>
                  </div>

                  {d?.bio ? (
                    <p className="mt-3 line-clamp-3 text-sm text-slate-600">{d.bio}</p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">
                      Book an appointment to consult with this doctor.
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/appointments?doctorId=${encodeURIComponent(d._id)}`}
                      className="inline-flex items-center justify-center rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421]"
                    >
                      Book appointment
                    </Link>
                    <Link
                      to="/payments"
                      className="inline-flex items-center justify-center rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14]"
                    >
                      Payments
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
