import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function PaymentSuccess() {
  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        <div className="mx-auto flex min-h-[75vh] w-full max-w-6xl items-center justify-center px-6 py-16 lg:px-8">
          <div className="w-full rounded-2xl border border-[#D8EAF6] bg-white p-10 text-center shadow-sm lg:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#35B85A]/10 text-3xl text-[#35B85A]">
              ✓
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
              Payment Status
            </p>

            <h1 className="mt-4 text-4xl font-bold text-[#2459A6] sm:text-5xl">
              Payment Successful
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Your payment was completed successfully. You can view your payment
              history or return to your appointments.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/payments"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#2477B8] px-6 text-sm font-semibold text-white transition hover:bg-[#2459A6]"
              >
                View Payments
              </Link>

              <Link
                to="/appointments"
                className="inline-flex h-11 items-center justify-center rounded-md border border-[#2477B8]/30 bg-[#EAF6FF] px-6 text-sm font-semibold text-[#2477B8] transition hover:bg-[#2477B8] hover:text-white"
              >
                Back to Appointments
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}