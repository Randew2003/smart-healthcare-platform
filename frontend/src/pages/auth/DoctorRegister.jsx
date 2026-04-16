import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

const initialApplication = {
  dob: "",
  licenseNumber: "",
  specialization: "",
  clinicName: "",
  yearsExperience: "",
  idProofFileName: "",
  medicalCertificateFileName: ""
};

const specializationOptions = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Gynecologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Psychiatrist",
  "ENT Specialist",
  "Radiologist",
  "Anesthesiologist",
  "Other"
];

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    doctorApplication: initialApplication
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      doctorApplication: {
        ...prev.doctorApplication,
        [name]: value
      }
    }));
  };

  const handleDocumentChange = (e) => {
    const { name, files } = e.target;
    const fileName = files?.[0]?.name || "";

    setFormData((prev) => ({
      ...prev,
      doctorApplication: {
        ...prev.doctorApplication,
        [name]: fileName
      }
    }));
  };

  const parseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullName, email, password, doctorApplication } = formData;

    if (!fullName || !email || !password || !doctorApplication.licenseNumber || !doctorApplication.specialization) {
      setError("Full name, email, password, license number, and specialization are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone: formData.phone,
          role: "doctor",
          doctorApplication
        })
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        setError(data.message || "Doctor registration failed. Please try again.");
        return;
      }

      setSuccess(data.message || "Doctor registration submitted successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_24%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#0b1220_100%)]" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
          <section className="lg:col-span-5">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-lime-200 backdrop-blur">
              Doctor Access
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Register as a doctor and join the verification workflow.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Complete your profile, submit your professional details, and wait for admin approval before logging in.
              No doctor dashboard access is available until verification is complete.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Backend-matched doctor application",
                "Admin verification required",
                "Secure registration flow",
                "Professional onboarding layout"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-lg shadow-black/10 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lime-700">
                  Doctor Registration
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Set up your doctor profile
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  This form sends your professional information to the backend doctorApplication payload
                  for admin review and approval before login access is granted.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.doctorApplication.dob}
                      onChange={handleApplicationChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.doctorApplication.licenseNumber}
                      onChange={handleApplicationChange}
                      placeholder="Enter medical license number"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Specialization</label>
                    <select
                      name="specialization"
                      value={formData.doctorApplication.specialization}
                      onChange={handleApplicationChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    >
                      <option value="">Select specialization</option>
                      {specializationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Clinic / Hospital Name</label>
                    <input
                      type="text"
                      name="clinicName"
                      value={formData.doctorApplication.clinicName}
                      onChange={handleApplicationChange}
                      placeholder="Enter clinic or hospital name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      name="yearsExperience"
                      value={formData.doctorApplication.yearsExperience}
                      onChange={handleApplicationChange}
                      placeholder="Enter years of experience"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">ID Proof Document</label>
                    <input
                      type="file"
                      name="idProofFileName"
                      onChange={handleDocumentChange}
                      accept="image/*,.pdf"
                      className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-lime-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-lime-700 focus:outline-none focus:ring-4 focus:ring-lime-100"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Selected file: {formData.doctorApplication.idProofFileName || "None"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Medical Certificate Document</label>
                  <input
                    type="file"
                    name="medicalCertificateFileName"
                    onChange={handleDocumentChange}
                    accept="image/*,.pdf"
                    className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-lime-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-lime-700 focus:outline-none focus:ring-4 focus:ring-lime-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Selected file: {formData.doctorApplication.medicalCertificateFileName || "None"}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-xl bg-linear-to-r from-lime-600 to-amber-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-lime-500/20 transition hover:shadow-xl hover:shadow-lime-500/25 ${
                    loading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {loading ? "Submitting..." : "Register as Doctor"}
                </button>
              </form>

              <div className="mt-6 text-sm text-slate-600">
                Already registered?{" "}
                <Link to="/login" className="font-semibold text-lime-700 transition hover:text-lime-800">
                  Login here
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
