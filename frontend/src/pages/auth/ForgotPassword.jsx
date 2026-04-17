import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const query = useQuery();
  const prefilledEmail = query.get("email") || "";
  const [email, setEmail] = useState(prefilledEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requestAccepted, setRequestAccepted] = useState(false);

  const hasPrefilledEmail = !!prefilledEmail;

  const resetLink = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return "/reset-password";
    return `/reset-password?email=${encodeURIComponent(trimmed)}`;
  }, [email]);

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
    setRequestAccepted(false);

    const trimmed = email.trim();
    if (!hasPrefilledEmail) {
      setError("Please start from Login so your registered email is auto-filled.");
      return;
    }
    if (!trimmed) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: trimmed })
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        setError(data.message || "Failed to send OTP. Please try again.");
        return;
      }

      setSuccess(
        data.message ||
          "If an account exists for this email, a reset OTP has been sent."
      );

      setRequestAccepted(true);
      setTimeout(() => {
        navigate(resetLink);
      }, 800);
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
              Password Recovery
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Request a reset OTP.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              This uses your backend endpoint <span className="font-semibold">POST /api/auth/forgot-password</span>
              and sends an OTP to your email address.
            </p>
          </section>

          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lime-700">
                  Forgot Password
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Enter your email
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  We will send a one-time OTP to reset your password.
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
                      Email is auto-filled from the Login step to prevent mistakes.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !hasPrefilledEmail}
                  className={`inline-flex items-center justify-center rounded-xl bg-linear-to-r from-lime-600 to-amber-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-lime-500/20 transition hover:shadow-xl hover:shadow-lime-500/25 ${
                    loading || !hasPrefilledEmail ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>

              {requestAccepted && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">Check your email</div>
                  <div className="mt-1">
                    Redirecting to reset password… If it doesn&apos;t move, continue manually. Also check your spam/junk folder.
                  </div>
                  <div className="mt-3">
                    <Link
                      to={resetLink}
                      className="inline-flex items-center justify-center rounded-lg bg-[#0070cd] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Continue to Reset Password
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  Back to{" "}
                  <Link to="/login" className="font-semibold text-lime-700 transition hover:text-lime-800">
                    Login
                  </Link>
                </div>
                <div>
                  Admin?{" "}
                  <Link to="/admin/login" className="font-semibold text-lime-700 transition hover:text-lime-800">
                    Use Admin Login
                  </Link>
                </div>
              </div>

              {!hasPrefilledEmail && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  Enter your email in <Link to="/login" className="font-semibold underline">Login</Link> and click “Forgot password?” to auto-fill it here.
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
