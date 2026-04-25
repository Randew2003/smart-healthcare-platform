import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";

export default function Payments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);

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

  const totalAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p?.amount || 0), 0);
  }, [payments]);

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (["paid", "success", "completed"].includes(value)) {
      return "bg-[#35B85A]/10 text-[#23823d]";
    }

    if (value === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (["failed", "cancelled", "canceled"].includes(value)) {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                Payment Transactions
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2459A6] sm:text-4xl">
                Your Payment History
              </h1>
            </div>

            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              View your appointment payment transactions including completed,
              pending, cancelled, and failed payments.
            </p>
          </div>

          {!isLoggedIn() && (
            <div className="mt-8 rounded-xl border border-[#D8EAF6] bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
              Please login to view your payment transactions.
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#35B85A]">
                Total Records
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#2459A6]">
                {payments.length}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                All payment transactions
              </p>
            </div>

            <div className="rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#35B85A]">
                Total Amount
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#2459A6]">
                LKR {totalAmount.toLocaleString()}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Including pending records
              </p>
            </div>

            <div className="rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#35B85A]">
                Sandbox Note
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#2459A6]">
                Pending
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Localhost notify URL may not update status
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-4 border-b border-[#D8EAF6] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2459A6]">
                  Transaction History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pending payments are also shown for sandbox testing.
                </p>
              </div>

              <button
                onClick={loadMyPayments}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#2477B8]/30 bg-[#EAF6FF] px-5 text-sm font-semibold text-[#2477B8] transition hover:bg-[#2477B8] hover:text-white"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-8 rounded-xl border border-[#D8EAF6] bg-[#F6FAFD] px-5 py-10 text-center text-sm text-slate-500">
                Loading transactions...
              </div>
            ) : payments.length === 0 ? (
              <div className="mt-8 rounded-xl border border-[#D8EAF6] bg-[#F6FAFD] px-5 py-12 text-center">
                <h3 className="text-lg font-semibold text-[#2459A6]">
                  No payments yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Your payment transactions will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-xl border border-[#D8EAF6]">
                <div className="hidden grid-cols-5 bg-[#EAF6FF] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#2459A6] md:grid">
                  <span>Status</span>
                  <span>Order ID</span>
                  <span>Appointment</span>
                  <span>Amount</span>
                  <span>Currency</span>
                </div>

                <div className="divide-y divide-[#D8EAF6]">
                  {payments.map((p) => (
                    <div
                      key={p._id || p.orderId}
                      className="grid gap-3 bg-white px-5 py-4 text-sm md:grid-cols-5 md:items-center"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                          Status
                        </p>
                        <span
                          className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            p.status
                          )}`}
                        >
                          {p.status || "Pending"}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                          Order ID
                        </p>
                        <p className="font-medium text-slate-700">
                          {p.orderId || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                          Appointment
                        </p>
                        <p className="font-medium text-slate-700">
                          {p.appointmentId || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                          Amount
                        </p>
                        <p className="font-semibold text-[#2459A6]">
                          {Number(p.amount || 0).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                          Currency
                        </p>
                        <p className="font-medium text-slate-700">
                          {p.currency || "LKR"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-800">
            PayHere sandbox may keep payments as pending if your backend
            <strong> notify_url </strong>
            is localhost. Use a public URL like ngrok for backend callback
            testing, then update status from PayHere status_code.
          </div>
        </div>
      </section>
    </MainLayout>
  );
}