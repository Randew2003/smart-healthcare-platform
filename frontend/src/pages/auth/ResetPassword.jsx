import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const query = useQuery();
  const prefilledEmail = query.get("email") || "";
  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasPrefilledEmail = !!prefilledEmail;

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

    const trimmedEmail = email.trim();
    if (!hasPrefilledEmail) {
      setError("Please start from Forgot Password so your email is auto-filled.");
      return;
    }
    if (!trimmedEmail || !otp.trim() || !password) {
      setError("Email, OTP, and new password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: trimmedEmail,
          otp: otp.trim(),
          password
        })
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        setError(data.message || "Password reset failed. Please try again.");
        return;
      }

      setSuccess(data.message || "Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
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
              Reset Password
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Use the OTP to set a new password.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              This uses your backend endpoint <span className="font-semibold">POST /api/auth/reset-password</span>
              with <span className="font-semibold">email</span>, <span className="font-semibold">otp</span>, and <span className="font-semibold">password</span>.
            </p>
          </section>

          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lime-700">
                  Reset Password
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Enter OTP and new password
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Check your email inbox for the OTP (valid for a limited time).
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
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={hasPrefilledEmail}
                    disabled={hasPrefilledEmail}
                    placeholder="Enter your email"
                    className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100 ${
                      hasPrefilledEmail ? "cursor-not-allowed opacity-80" : ""
                    }`}
                  />
                  {!hasPrefilledEmail && (
                    <p className="mt-2 text-xs text-slate-600">
                      For security and fewer mistakes, email is auto-filled from the Forgot Password step.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">OTP Code</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter the OTP"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !hasPrefilledEmail}
                  className={`inline-flex items-center justify-center rounded-xl bg-linear-to-r from-lime-600 to-amber-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-lime-500/20 transition hover:shadow-xl hover:shadow-lime-500/25 ${
                    loading || !hasPrefilledEmail ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  Need an OTP?{" "}
                  <Link to="/forgot-password" className="font-semibold text-lime-700 transition hover:text-lime-800">
                    Request OTP
                  </Link>
                </div>
                <div>
                  Back to{" "}
                  <Link to="/login" className="font-semibold text-lime-700 transition hover:text-lime-800">
                    Login
                  </Link>
                </div>
              </div>

              {!hasPrefilledEmail && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  Start from <Link to="/forgot-password" className="font-semibold underline">Forgot Password</Link> to auto-fill your email.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
