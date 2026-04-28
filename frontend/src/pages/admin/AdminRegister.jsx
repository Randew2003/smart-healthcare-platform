import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    adminSecret: ""
  });

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^0\d{9}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-out-quart",
      once: true,
      offset: 60
    });
  }, []);

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
    const adminSecret = formData.adminSecret.trim();

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

    if (!adminSecret) {
      setError("Admin secret key is required.");
      return;
    }

    if (adminSecret.length < 6) {
      setError("Admin secret key must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone,
          adminSecret,
          role: "admin"
        })
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess("Admin registered successfully. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 1800);
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
        <div className="absolute inset-0" aria-hidden="true">
          <div
            className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl"
            data-aos="zoom-in"
            data-aos-delay="100"
          />
          <div
            className="absolute right-0 top-44 h-72 w-72 rounded-full bg-blue-200/40 blur-[90px]"
            data-aos="zoom-in"
            data-aos-delay="200"
          />
          <div
            className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-cyan-200/40 blur-[80px]"
            data-aos="zoom-in"
            data-aos-delay="300"
          />
        </div>
        <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
          <section className="lg:col-span-5" data-aos="fade-right">
            <div
              className="inline-flex items-center rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 shadow-sm"
              data-aos="fade-down"
            >
              Admin Access
            </div>

            <h1
              className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Create a secure admin account for the platform.
            </h1>

            <p
              className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              Register with the admin secret key and get controlled access to user management,
              doctor verification, and platform operations.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2" data-aos="fade-up" data-aos-delay="200">
              {[
                "Protected with admin secret key",
                "Direct access to management tools",
                "Instant JWT login after register",
                "Role-based access workflow"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-blue-100 bg-white p-4 text-sm text-slate-700 shadow-[0_10px_30px_rgba(37,99,235,0.06)]"
                  data-aos="zoom-in"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-7" data-aos="fade-left">
            <div
              className="rounded-[28px] border border-blue-100 bg-white/95 p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10"
              data-aos="zoom-in"
              data-aos-delay="150"
            >
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Admin Registration
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Set up the admin account
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Fill in the details below to create an admin account. The secret key must match
                  the backend configuration.
                </p>
              </div>

              {error && (
                <div
                  className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  data-aos="fade-down"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                  data-aos="fade-down"
                >
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
                      data-aos="fade-up"
                      data-aos-delay="200"
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
                      data-aos="fade-up"
                      data-aos-delay="230"
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
                      placeholder="Enter your password"
                      required
                      minLength={6}
                      title="At least 6 characters with uppercase, lowercase, number, and special character"
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      data-aos="fade-up"
                      data-aos-delay="260"
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
                      data-aos="fade-up"
                      data-aos-delay="290"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Admin Secret Key</label>
                  <input
                    type="password"
                    name="adminSecret"
                    value={formData.adminSecret}
                    onChange={handleChange}
                    placeholder="Enter the admin registration secret"
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    data-aos="fade-up"
                    data-aos-delay="320"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl hover:shadow-blue-500/25 ${
                    loading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                  data-aos="fade-up"
                  data-aos-delay="360"
                >
                  {loading ? "Registering..." : "Register as Admin"}
                </button>
              </form>

              <div className="mt-6 text-sm text-slate-600" data-aos="fade-up" data-aos-delay="400">
                Already have an account?{" "}
                <Link to="/admin/login" className="font-semibold text-blue-700 transition hover:text-blue-800">
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
