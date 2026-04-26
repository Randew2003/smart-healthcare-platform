import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";
import { normalizeApiPayload, useDoctorServiceId } from "./doctorUtils";
import banner from "../../assets/patientassets/banner2.png";

export default function DoctorProfile() {
  const user = getUser();
  const { doctorId, setDoctorId, resolving, resolvedFrom } = useDoctorServiceId();

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [exists, setExists] = useState(false);

  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState(0);
  const [phone, setPhone] = useState(user?.phone || "");
  const [hospital, setHospital] = useState("");
  const [bio, setBio] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");

  const load = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (!doctorId) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(`/api/doctors/${encodeURIComponent(doctorId)}`);
      const payload = normalizeApiPayload(data);
      const d = payload?.data || payload;

      setExists(true);
      setName(d?.name || "");
      setEmail(d?.email || user?.email || "");
      setSpecialization(d?.specialization || "");
      setExperience(Number(d?.experience || 0));
      setPhone(d?.phone || "");
      setHospital(d?.hospital || "");
      setBio(d?.bio || "");
      setLicenseNumber(d?.licenseNumber || "");
      setVerificationStatus(d?.verificationStatus || "");
      setEditing(false);
    } catch (err) {
      if (err?.response?.status === 404) {
        setExists(false);
        setEditing(true);
        setError("Doctor record not found in doctor-service. You can create it below.");
        return;
      }
      setExists(false);
      setError(err?.response?.data?.message || "Failed to load doctor profile.");
    } finally {
      setLoading(false);
    }
  }, [doctorId, user?.email]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      setError("Please login first.");
      return;
    }

    if (!name || !email || !specialization) {
      setError("Name, email, and specialization are required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const payload = {
      name,
      email,
      specialization,
      experience: Number(experience || 0),
      phone,
      hospital,
      bio,
      licenseNumber
    };

    try {
      if (exists && doctorId) {
        const { data } = await api.put(`/api/doctors/${encodeURIComponent(doctorId)}`, payload);
        setMessage(data?.message || "Doctor profile updated.");
      } else {
        const { data } = await api.post("/api/doctors", payload);
        const created = normalizeApiPayload(data);
        const createdDoctor = created?.data || created;
        if (createdDoctor?._id) {
          setDoctorId(createdDoctor._id);
        }
        setExists(true);
        setEditing(false);
        setMessage(data?.message || "Doctor profile created.");
      }

      if (exists) {
        setEditing(false);
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save doctor profile.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";
  const detailCardClass = "rounded-2xl border border-slate-200 bg-slate-50/70 p-4";
  const detailLabelClass = "text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500";
  const detailValueClass = "mt-2 text-sm font-semibold text-slate-900";

  const doctorDetails = [
    { label: "Name", value: name || "-" },
    { label: "Email", value: email || "-" },
    { label: "Specialization", value: specialization || "-" },
    { label: "Experience", value: `${Number(experience || 0)} years` },
    { label: "Phone", value: phone || "-" },
    { label: "Hospital", value: hospital || "-" },
    { label: "License Number", value: licenseNumber || "-" },
    { label: "Bio", value: bio || "-" }
  ];

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[200px] sm:h-[240px] lg:h-[280px]">
            <img
              src={banner}
              alt="Doctor profile"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />
            <div className="relative flex h-full items-center p-5 sm:p-8">
              <div className="max-w-2xl">
                <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#00bbb3]">
                  Doctor Service
                </div>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Doctor Profile
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                  Manage your doctor-service profile record.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Profile details</h2>
              <p className="mt-1 text-sm text-slate-600">Create or update your doctor profile information.</p>
            </div>

            <button
              onClick={load}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14]"
            >
              Refresh
            </button>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Login as a verified doctor to manage your profile.
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-full border border-[#80c342]/30 bg-[#80c342]/10 px-3 py-1 text-xs font-extrabold text-[#2f6b14]">
                {exists ? "Profile exists" : "No profile found"}
              </div>

              <div className="text-xs text-slate-600">
                Doctor Service ID: <span className="font-mono font-semibold">{doctorId || "-"}</span>
                {resolvedFrom ? <span className="text-slate-400"> • {resolvedFrom}</span> : null}
                {resolving ? <span className="text-slate-400"> • resolving...</span> : null}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-extrabold text-slate-700">Set doctor service id</label>
              <input
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Paste doctor-service doctor _id"
                className={inputClass}
              />
            </div>

            {verificationStatus ? (
              <div className="mt-4 rounded-xl border border-[#fbb033]/35 bg-[#fbb033]/10 px-4 py-3 text-sm font-semibold text-[#7a4d00]">
                Verification status: {verificationStatus}
              </div>
            ) : null}

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

            {!editing && exists ? (
              <div className="mt-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {doctorDetails.map((detail) => (
                    <div key={detail.label} className={detailCardClass}>
                      <div className={detailLabelClass}>{detail.label}</div>
                      <div className={detailValueClass}>{detail.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setMessage("");
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-[#00bbb3]/20 bg-[#00bbb3]/10 px-4 py-2 text-sm font-black text-[#007c78] hover:bg-[#00bbb3]/15"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={save} className="mt-5 grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Specialization</label>
                    <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Experience (years)</label>
                    <input
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value || 0))}
                      type="number"
                      min={0}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Hospital</label>
                    <input value={hospital} onChange={(e) => setHospital(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">License number</label>
                    <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Bio</label>
                    <input value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  {exists ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setError("");
                        setMessage("");
                        load();
                      }}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  ) : null}

                  <button
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                    type="submit"
                  >
                    {loading ? "Saving..." : exists ? "Update profile" : "Create profile"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
