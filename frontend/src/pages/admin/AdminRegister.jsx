import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../../components/Footer";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
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

    if (!formData.fullName || !formData.email || !formData.password || !formData.adminSecret) {
      setError("All fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
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
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          adminSecret: formData.adminSecret,
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_24%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#0b1220_100%)]" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
          <section className="lg:col-span-5">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-lime-200 backdrop-blur">
              Admin Access
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Create a secure admin account for the platform.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Register with the admin secret key and get controlled access to user management,
              doctor verification, and platform operations.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Protected with admin secret key",
                "Direct access to management tools",
                "Instant JWT login after register",
                "Role-based access workflow"
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
                  Admin Registration
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Set up the admin account
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Fill in the details below to create an admin account. The secret key must match
                  the backend configuration.
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
                      placeholder="Enter your password"
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Admin Secret Key</label>
                  <input
                    type="password"
                    name="adminSecret"
                    value={formData.adminSecret}
                    onChange={handleChange}
                    placeholder="Enter the admin registration secret"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-xl bg-linear-to-r from-lime-600 to-amber-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-lime-500/20 transition hover:shadow-xl hover:shadow-lime-500/25 ${
                    loading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {loading ? "Registering..." : "Register as Admin"}
                </button>
              </form>

              <div className="mt-6 text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/admin/login" className="font-semibold text-lime-700 transition hover:text-lime-800">
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
