import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function NotFound() {
  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        <div className="mx-auto flex min-h-[75vh] w-full max-w-6xl items-center justify-center px-6 py-16 lg:px-8">
          
          <div className="w-full rounded-2xl border border-[#D8EAF6] bg-white p-10 text-center shadow-sm lg:p-14">
            
            {/* SMALL LABEL */}
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
              Error 404
            </p>

            {/* TITLE */}
            <h1 className="mt-4 text-4xl font-bold text-[#2459A6] sm:text-5xl">
              Page Not Found
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-5 max-w-xl mx-auto text-sm leading-7 text-slate-600 sm:text-base">
              The page you are looking for doesn’t exist or may have been moved.  
              Please check the URL or navigate back to a valid page.
            </p>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#2477B8] px-6 text-sm font-semibold text-white transition hover:bg-[#2459A6]"
              >
                Go Home
              </Link>

              <Link
                to="/appointments"
                className="inline-flex h-11 items-center justify-center rounded-md border border-[#2477B8]/30 bg-[#EAF6FF] px-6 text-sm font-semibold text-[#2477B8] transition hover:bg-[#2477B8] hover:text-white"
              >
                Book Appointment
              </Link>
            </div>

            {/* OPTIONAL HELPER TEXT */}
            <div className="mt-10 text-xs text-slate-400">
              If the problem continues, please contact support.
            </div>

          </div>
        </div>
      </section>
    </MainLayout>
  );
}