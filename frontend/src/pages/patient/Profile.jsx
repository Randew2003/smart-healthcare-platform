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

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-slate-200 bg-[#F6FAFD] px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2477B8] focus:bg-white focus:ring-2 focus:ring-[#2477B8]/15";

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
          bloodGroup,
        });
        setProfile(data?.patient);
        setMessage(data?.message || "Profile created successfully.");
      } else {
        const { data } = await api.put("/api/patients/me", {
          fullName,
          email,
          phone,
          address,
          gender,
          bloodGroup,
        });
        setProfile(data?.patient);
        setMessage(data?.message || "Profile updated successfully.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                Patient Profile
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2459A6] sm:text-4xl">
                Manage Your Patient Information
              </h1>
            </div>

            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              Keep your details accurate so appointments, payments, and
              healthcare communication can work smoothly.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-4 border-b border-[#D8EAF6] pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2459A6]">
                  Basic Profile Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update your contact and health-related information.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                User ID:{" "}
                <span className="font-mono font-semibold text-[#2477B8]">
                  {user?.id || "-"}
                </span>
              </div>
            </div>

            {!isLoggedIn() && (
              <div className="mt-5 rounded-xl border border-[#D8EAF6] bg-[#F6FAFD] px-5 py-3 text-sm text-slate-600">
                Please login to manage your profile.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl border border-[#35B85A]/25 bg-[#35B85A]/10 px-5 py-3 text-sm font-semibold text-[#23823d]">
                {message}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D8EAF6] bg-[#F6FAFD] px-5 py-4">
              <span className="rounded-md bg-[#EAF6FF] px-3 py-1 text-xs font-semibold text-[#2477B8]">
                {profile ? "Profile exists" : "No profile yet"}
              </span>

              <span className="text-xs text-slate-500">
                Keep your info accurate for appointments & payments.
              </span>
            </div>

            <form onSubmit={save} className="mt-7 grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Phone
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className={inputClass}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Blood Group
                  </label>
                  <input
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    placeholder="Example: O+"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Address
                  </label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClass}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-[#2477B8] px-6 text-sm font-semibold text-white transition hover:bg-[#2459A6] disabled:opacity-60"
                  type="submit"
                >
                  {loading
                    ? "Saving..."
                    : profile
                    ? "Update Profile"
                    : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}