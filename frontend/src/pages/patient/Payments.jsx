import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";
import { submitPayHereCheckout } from "../../utils/payhereCheckout";

export default function Payments() {
  const user = getUser();

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);

  const [appointmentId, setAppointmentId] = useState("");
  const [amount, setAmount] = useState(1500);

  const loadMyPayments = async () => {
    if (!isLoggedIn()) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/payments/my");
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setPayments([]);
      setError(err?.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyPayments();
  }, []);

  const createPayment = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      setError("Please login first.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const { data } = await api.post("/api/payments", {
        appointmentId,
        amount,
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || ""
      });

      submitPayHereCheckout(data?.payhere);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create payment.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <MainLayout>
      <section className="bg-[#f5fbff]">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

          {/* 🔹 Header */}
          <div className="mb-8 border-b border-[#d9edf9] pb-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">
              Payments
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#02539d] sm:text-4xl">
              Manage Your Payments
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Create payments for appointments and view your payment history securely.
            </p>
          </div>

          {/* 🔹 Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {!isLoggedIn() && (
            <div className="mb-6 rounded-xl border border-[#d9edf9] bg-white px-4 py-3 text-sm text-slate-600">
              Please login to make payments.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* 🔹 Create Payment */}
            <div className="rounded-[24px] border border-[#d9edf9] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#02539d]">
                Pay for an Appointment
              </h2>

              <form onSubmit={createPayment} className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Appointment ID
                  </label>
                  <input
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                    required
                    className="mt-2 h-11 w-full rounded-xl border border-[#cfe3f3] px-4 text-sm outline-none focus:border-[#00bbb3] focus:ring-2 focus:ring-[#00bbb3]/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Amount (LKR)
                  </label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value || 0))}
                    type="number"
                    min={1}
                    required
                    className="mt-2 h-11 w-full rounded-xl border border-[#cfe3f3] px-4 text-sm outline-none focus:border-[#00bbb3] focus:ring-2 focus:ring-[#00bbb3]/20"
                  />
                </div>

                <button
                  disabled={creating}
                  className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#0070cd] text-sm font-extrabold text-white hover:bg-[#02539d] disabled:opacity-60"
                >
                  {creating ? "Redirecting..." : "Pay with PayHere"}
                </button>

                <p className="text-xs text-slate-500">
                  After payment, you will be redirected to success or cancel page.
                </p>
              </form>
            </div>

            {/* 🔹 Payment History */}
            <div className="rounded-[24px] border border-[#d9edf9] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#02539d]">
                  My Payments
                </h2>

                <button
                  onClick={loadMyPayments}
                  className="text-sm font-bold text-[#0070cd] hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="mt-4 text-sm text-slate-500">Loading...</div>
              ) : payments.length === 0 ? (
                <div className="mt-6 rounded-xl border border-[#d9edf9] bg-[#f8fcff] px-4 py-8 text-center text-sm text-slate-600">
                  No payments yet.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {payments.map((p) => (
                    <div
                      key={p._id}
                      className="rounded-xl border border-[#d9edf9] bg-[#fcfeff] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#02539d]">
                          {p.status}
                        </span>

                        <span className="text-xs font-bold text-[#00bbb3]">
                          {p.currency}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-600">
                        <strong>Order:</strong> {p.orderId}
                      </div>

                      <div className="mt-1 text-xs text-slate-600">
                        <strong>Appointment:</strong> {p.appointmentId}
                      </div>

                      <div className="mt-1 text-xs text-slate-600">
                        <strong>Amount:</strong> {p.amount} {p.currency}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </MainLayout>
  );
}