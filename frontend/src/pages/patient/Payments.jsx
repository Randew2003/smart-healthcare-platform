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
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-[170px]">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Payments</h1>
              <p className="mt-1 text-sm text-slate-600">Create PayHere payments and view your payment history.</p>
            </div>
            <button
              onClick={loadMyPayments}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14]"
            >
              Refresh
            </button>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Login to make payments.
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-black text-slate-900">Pay for an appointment</h2>
              <form onSubmit={createPayment} className="mt-4 grid gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Appointment ID</label>
                  <input
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700">Amount (LKR)</label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value || 0))}
                    type="number"
                    min={1}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20"
                  />
                </div>

                <button
                  disabled={creating}
                  className="mt-1 inline-flex items-center justify-center rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                  type="submit"
                >
                  {creating ? "Redirecting..." : "Pay with PayHere"}
                </button>

                <p className="text-xs text-slate-500">
                  PayHere returns to <span className="font-bold">/payment-success</span> and <span className="font-bold">/payment-cancel</span>.
                </p>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-black text-slate-900">My payments</h2>
              {loading ? <div className="mt-3 text-sm text-slate-600">Loading...</div> : null}

              <div className="mt-4 grid gap-3">
                {payments.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-black/5 bg-[#fbfdf9] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-black text-slate-900">{p.status}</div>
                      <div className="rounded-full border border-[#fbb033]/35 bg-[#fbb033]/15 px-3 py-1 text-xs font-extrabold text-[#7a4d00]">
                        {p.currency}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      <span className="font-extrabold">Order:</span> <span className="font-mono">{p.orderId}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      <span className="font-extrabold">Appointment:</span> <span className="font-mono">{p.appointmentId}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      <span className="font-extrabold">Amount:</span> {p.amount} {p.currency}
                    </div>
                  </div>
                ))}

                {!loading && payments.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                    No payments yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
