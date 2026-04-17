import MainLayout from "../../layouts/MainLayout";

const services = [
  {
    title: "Doctor Appointments",
    text: "Find verified doctors and book appointments in minutes."
  },
  {
    title: "Medical Records",
    text: "Create and manage your patient profile with essential information."
  },
  {
    title: "Secure Payments",
    text: "Pay for appointments safely via PayHere integration."
  },
  {
    title: "Notifications",
    text: "Get important updates and reminders for your healthcare journey."
  }
];

export default function Services() {
  return (
    <MainLayout>
      <section className="bg-[#f5fbff]">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

          {/* 🔹 Intro */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">
              Our Services
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-[#02539d] sm:text-4xl">
              Everything You Need in One Place
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              We provide a complete digital healthcare experience for patients.
            </p>
          </div>

          {/* 🔹 Services Grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.title}
                className="rounded-[24px] border border-[#d9edf9] bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00bbb3]/10 text-[#00bbb3] font-extrabold text-lg">
                    ✓
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-extrabold text-[#02539d]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-6">
                      {s.text}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* 🔹 Tip Section */}
          <div className="mt-10 rounded-[24px] border border-[#d9edf9] bg-white p-6 shadow-sm">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#00bbb3]">
              Quick Tip
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Start by creating your patient profile in{" "}
              <span className="font-extrabold text-[#02539d]">Profile</span>, then
              book an appointment with your preferred doctor.
            </p>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}