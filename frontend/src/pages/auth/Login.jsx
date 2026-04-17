import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/Footer";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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

  const getRedirectPath = (user) => {
    if (!user?.role) return "/";

    if (user.role === "doctor") return "/appointments";
    if (user.role === "admin") return "/admin";

    return "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      if (data.token && data.user) {
        if (data.user.role === "admin") {
          setError("Admin accounts must sign in from the Admin Login page.");
          return;
        }

        login({
          token: data.token,
          user: data.user
        });

        navigate(getRedirectPath(data.user));
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const trimmedEmail = formData.email.trim();
  const forgotLink = trimmedEmail
    ? `/forgot-password?email=${encodeURIComponent(trimmedEmail)}`
    : "/forgot-password";

  return (
    <div className="min-h-screen bg-[#f4f9ff] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)]" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
          <section className="lg:col-span-5">
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 shadow-sm">
              Secure Login
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Sign in with a clean, secure healthcare workspace.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
              Access your patient account, verified doctor space, or admin portal from one modern entry point.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Role-based redirect after login",
                "AuthContext session storage",
                "Patient, doctor, and admin access",
                "Light blue and white UI system"
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
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                    Login
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    Use your registered email and password to access your account.
                  </p>
                </div>
                <div className="hidden rounded-2xl bg-blue-50 px-4 py-3 text-right sm:block">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Tip</div>
                  <div className="mt-1 text-xs text-slate-600">Use your role-specific account to continue.</div>
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

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 to-sky-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.24)] transition hover:shadow-[0_16px_36px_rgba(59,130,246,0.28)] ${
                    loading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>

              <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  Need a patient account?{" "}
                  <Link to="/register" className="font-semibold text-blue-700 transition hover:text-blue-800">
                    Get Started
                  </Link>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  Register as a doctor?{" "}
                  <Link to="/register/doctor" className="font-semibold text-blue-700 transition hover:text-blue-800">
                    Apply here
                  </Link>
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-600">
                <Link to={forgotLink} className="font-semibold text-blue-700 transition hover:text-blue-800">
                  Forgot password?
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