import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function PaymentSuccess() {
  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <h1 className="text-2xl font-black text-green-800">Payment successful</h1>
          <p className="mt-2 text-sm text-green-800/90">
            Your payment was completed successfully.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/payments"
              className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421]"
            >
              View payments
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
