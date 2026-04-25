import MainLayout from "../../layouts/MainLayout";

const services = [
  {
    title: "Doctor Appointments",
    text: "Find verified doctors, check available services, and book appointments quickly through a simple patient-friendly process.",
  },
  {
    title: "Medical Records",
    text: "Create and manage your patient profile with important health information, reports, and treatment details.",
  },
  {
    title: "Secure Payments",
    text: "Pay for appointments safely through secure online payment support and manage your healthcare transactions easily.",
  },
  {
    title: "Notifications",
    text: "Receive important appointment updates, reminders, and healthcare-related alerts throughout your care journey.",
  },
];

export default function Services() {
  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                Our Services
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2459A6] sm:text-4xl">
                Everything Patients Need In One Place
              </h1>
            </div>

            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              HealthCare provides a complete digital healthcare experience for
              appointments, patient records, secure payments, and important care
              updates.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#2477B8]/40 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF6FF] text-sm font-bold text-[#2477B8]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#2459A6]">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {service.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                  Quick Tip
                </p>

                <h2 className="mt-3 text-2xl font-bold text-[#2459A6]">
                  Start With Your Patient Profile
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Create your patient profile first, then book an appointment
                  with your preferred doctor for a smoother healthcare
                  experience.
                </p>
              </div>

              <div className="rounded-xl bg-[#EAF6FF] px-5 py-4 text-sm">
                <p className="font-semibold text-[#2459A6]">
                  Recommended first step
                </p>
                <p className="mt-1 text-slate-500">
                  Profile → Doctor → Appointment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}