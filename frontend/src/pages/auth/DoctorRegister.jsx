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

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^0\d{9}$/;
  const licensePattern = /^[A-Za-z0-9\-\/]{4,30}$/;

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

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const phone = formData.phone.trim();
    const doctorApplication = {
      ...formData.doctorApplication,
      dob: formData.doctorApplication.dob.trim(),
      licenseNumber: formData.doctorApplication.licenseNumber.trim(),
      specialization: formData.doctorApplication.specialization.trim(),
      clinicName: formData.doctorApplication.clinicName.trim(),
      yearsExperience: formData.doctorApplication.yearsExperience.trim(),
      idProofFileName: formData.doctorApplication.idProofFileName.trim(),
      medicalCertificateFileName: formData.doctorApplication.medicalCertificateFileName.trim()
    };

    if (!fullName) {
      setError("Full name is required.");
      return;
    }

    if (fullName.length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (!passwordPattern.test(password)) {
      setError(
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (phone && !phonePattern.test(phone)) {
      setError("Phone number must start with 0 and be 10 digits (e.g. 0712345678).");
      return;
    }

    if (!doctorApplication.dob) {
      setError("Date of birth is required.");
      return;
    }

    const dobDate = new Date(doctorApplication.dob);
    if (Number.isNaN(dobDate.getTime())) {
      setError("Please enter a valid date of birth.");
      return;
    }

    if (dobDate >= new Date()) {
      setError("Date of birth must be in the past.");
      return;
    }

    if (!doctorApplication.licenseNumber) {
      setError("License number is required.");
      return;
    }

    if (!licensePattern.test(doctorApplication.licenseNumber)) {
      setError("License number must be 4 to 30 characters and may include letters, numbers, -, or /.");
      return;
    }

    if (!doctorApplication.specialization) {
      setError("Specialization is required.");
      return;
    }

    if (!doctorApplication.clinicName) {
      setError("Clinic or hospital name is required.");
      return;
    }

    if (doctorApplication.clinicName.length < 2) {
      setError("Clinic or hospital name must be at least 2 characters.");
      return;
    }

    if (!doctorApplication.yearsExperience) {
      setError("Years of experience is required.");
      return;
    }

    const yearsExperience = Number(doctorApplication.yearsExperience);
    if (!Number.isInteger(yearsExperience) || yearsExperience < 0 || yearsExperience > 70) {
      setError("Years of experience must be a valid number between 0 and 70.");
      return;
    }

    if (!doctorApplication.idProofFileName) {
      setError("ID proof document is required.");
      return;
    }

    if (!doctorApplication.medicalCertificateFileName) {
      setError("Medical certificate document is required.");
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
          phone,
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
    <div className="min-h-screen bg-[#f4f9ff] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)]" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
          <section className="lg:col-span-5">
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 shadow-sm">
              Doctor Access
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Register as a doctor and join the verification workflow.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
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
                  className="rounded-2xl border border-blue-100 bg-white p-4 text-sm text-slate-700 shadow-[0_10px_30px_rgba(37,99,235,0.06)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="rounded-[28px] border border-blue-100 bg-white/95 p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
              <div className="mb-8 flex items-start justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Doctor Registration
                </p>
                <div className="hidden rounded-2xl bg-blue-50 px-4 py-3 text-right sm:block">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Tip</div>
                  <div className="mt-1 text-xs text-slate-600">Return home anytime using the icon button.</div>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                  aria-label="Go to home page"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 9.75V21h13.5V9.75" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21v-6h4.5v6" />
                  </svg>
                  Home
                </Link>
              </div>
              <div className="mb-8">
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Set up your doctor profile
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  This form sends your professional information to the backend doctorApplication payload
                  for admin review and approval before login access is granted.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
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
                      required
                      minLength={2}
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      required
                      minLength={6}
                      title="At least 6 characters with uppercase, lowercase, number, and special character"
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0XXXXXXXXX (10 digits)"
                      title="Start with 0 and enter 10 digits, e.g. 0712345678"
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      required
                      minLength={4}
                      maxLength={30}
                      pattern="[A-Za-z0-9\-/]{4,30}"
                      title="4 to 30 characters, letters/numbers and - or / only"
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      required
                      minLength={2}
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="70"
                      name="yearsExperience"
                      value={formData.doctorApplication.yearsExperience}
                      onChange={handleApplicationChange}
                      placeholder="Enter years of experience"
                      required
                      step="1"
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">ID Proof Document</label>
                    <input
                      type="file"
                      name="idProofFileName"
                      onChange={handleDocumentChange}
                      accept="image/*,.pdf"
                      required
                      className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
                    required
                    className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Selected file: {formData.doctorApplication.medicalCertificateFileName || "None"}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 to-sky-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.24)] transition hover:shadow-[0_16px_36px_rgba(59,130,246,0.28)] ${
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
