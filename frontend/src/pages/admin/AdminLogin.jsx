import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const trimmedEmail = formData.email.trim();
  const forgotLink = trimmedEmail
    ? `/forgot-password?email=${encodeURIComponent(trimmedEmail)}`
    : "/forgot-password";

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-out-quart",
      once: true,
      offset: 60
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      if (data.token && data.user) {
        if (data.user.role !== "admin") {
          setError("This account is not an admin. Please use the normal login page.");
          return;
        }

        login({
          token: data.token,
          user: data.user
        });

        navigate("/admin");
      } else {
        setError("Invalid response from server.");
      }
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
            className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl"
            data-aos="zoom-in"
            data-aos-delay="100"
          />
          <div
            className="absolute right-0 top-40 h-72 w-72 rounded-full bg-blue-200/40 blur-[90px]"
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
              Sign in to the admin control panel.
            </h1>

            <p
              className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              Access management tools, verify doctors, and supervise the
              platform from a secure admin-only workspace.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2" data-aos="fade-up" data-aos-delay="200">
              {[
                "Secure admin authentication",
                "JWT session stored on login",
                "Fast access to control tools",
                "Built for role-based access"
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
                  Admin Login
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Enter your admin credentials to continue. Only verified admin
                  accounts can access the panel.
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
                    data-aos="fade-up"
                    data-aos-delay="200"
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
                    data-aos="fade-up"
                    data-aos-delay="250"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl hover:shadow-blue-500/25 ${
                    loading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="mt-6 text-sm text-slate-600" data-aos="fade-up" data-aos-delay="350">
                Don&apos;t have an admin account?{" "}
                <Link to="/admin/register" className="font-semibold text-blue-700 transition hover:text-blue-800">
                  Register here
                </Link>
              </div>

              <div className="mt-3 text-sm text-slate-600" data-aos="fade-up" data-aos-delay="400">
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
