import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function NotFound() {
  return (
    <MainLayout>
      <section className="bg-[#f5fbff]">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full rounded-[28px] border border-[#d9edf9] bg-white p-8 shadow-sm sm:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">
                Error 404
              </p>

              <h1 className="mt-3 text-4xl font-extrabold text-[#02539d] sm:text-5xl">
                Page Not Found
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                The page you are looking for does not exist, may have been removed,
                or the link may be incorrect.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0070cd] px-6 text-sm font-extrabold text-white transition hover:bg-[#02539d]"
                >
                  Go Home
                </Link>

                <Link
                  to="/appointments"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#00bbb3]/30 bg-[#00bbb3]/10 px-6 text-sm font-extrabold text-[#0070cd] transition hover:bg-[#00bbb3]/20"
                >
                  Appointments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}