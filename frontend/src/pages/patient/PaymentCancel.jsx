import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function PaymentCancel() {
  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-[#fbb033]/35 bg-[#fbb033]/10 p-6">
          <h1 className="text-2xl font-black text-[#7a4d00]">Payment cancelled</h1>
          <p className="mt-2 text-sm text-slate-700">
            The payment was cancelled. You can try again.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/payments"
              className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421]"
            >
              Try again
            </Link>
            <Link
              to="/appointments"
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14]"
            >
              Back to appointments
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
