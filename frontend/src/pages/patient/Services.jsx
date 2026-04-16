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
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-[170px]">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Services</h1>
          <p className="mt-2 text-sm text-slate-600">
            Everything you need for a smooth patient experience.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {services.map((s) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#80c342]/12 text-[#2f6b14] flex items-center justify-center font-black">
                    ✓
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900">{s.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{s.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#fbb033]/35 bg-[#fbb033]/10 p-5">
            <div className="text-sm font-extrabold text-[#7a4d00]">Tip</div>
            <div className="mt-1 text-sm text-slate-700">
              Start by creating your patient profile in <span className="font-extrabold">Profile</span>, then book an appointment.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
