import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";

export default function Profile() {
  const user = getUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const load = async () => {
    if (!isLoggedIn()) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get("/api/patients/me");
      setProfile(data);
      setFullName(data?.fullName || "");
      setEmail(data?.email || "");
      setPhone(data?.phone || "");
      setAddress(data?.address || "");
      setGender(data?.gender || "");
      setBloodGroup(data?.bloodGroup || "");
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
        return;
      }
      setError(err?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      setError("Please login first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!profile) {
        const { data } = await api.post("/api/patients/profile", {
          fullName,
          email,
          phone,
          address,
          gender,
          bloodGroup
        });
        setProfile(data?.patient);
        setMessage(data?.message || "Profile created.");
      } else {
        const { data } = await api.put("/api/patients/me", {
          fullName,
          email,
          phone,
          address,
          gender,
          bloodGroup
        });
        setProfile(data?.patient);
        setMessage(data?.message || "Profile updated.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-[170px]">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Patient Profile</h1>
              <p className="mt-1 text-sm text-slate-600">Manage your basic patient information.</p>
            </div>

            <div className="text-xs text-slate-600">
              User ID: <span className="font-mono font-semibold">{user?.id || "-"}</span>
            </div>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Login to manage your profile.
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-full border border-[#80c342]/30 bg-[#80c342]/10 px-3 py-1 text-xs font-extrabold text-[#2f6b14]">
                {profile ? "Profile exists" : "No profile yet"}
              </div>
              <div className="text-xs text-slate-500">
                Keep your info accurate for appointments & payments.
              </div>
            </div>

            <form onSubmit={save} className="mt-5 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Gender</label>
                  <input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="male/female/other" className={inputClass} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Blood group</label>
                  <input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="O+" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Address</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                </div>
              </div>

              <button
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                type="submit"
              >
                {loading ? "Saving..." : profile ? "Update profile" : "Create profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
