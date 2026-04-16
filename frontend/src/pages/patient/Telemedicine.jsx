import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function Telemedicine() {
  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-[170px]">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Telemedicine</h1>
          <p className="mt-2 text-sm text-slate-600">
            Join online consultations using the meeting link in your appointment.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-extrabold text-slate-800">How to join</div>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Open your appointments.</li>
              <li>Find an appointment with a meeting link.</li>
              <li>Click “Join live session”.</li>
            </ol>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/appointments"
              className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421]"
            >
              Go to appointments
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14]"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
