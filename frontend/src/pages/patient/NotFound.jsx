import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-black text-slate-900">Page not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            The page you are looking for doesn’t exist.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/"
              className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421]"
            >
              Go home
            </Link>
            <Link
              to="/appointments"
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14]"
            >
              Appointments
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
