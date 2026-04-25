import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import contactBanner from "../../assets/patientassets/homeMiddleBanner.png";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        {/* BANNER IMAGE ONLY */}
        <div className="w-full overflow-hidden bg-white">
          <img
            src={contactBanner}
            alt="Contact Us Banner"
            className="h-[260px] w-full object-cover sm:h-[320px] lg:h-[380px]"
          />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
          {/* INTRO */}
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                Patient Support
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2459A6] sm:text-4xl">
                We’re Here To Help You
              </h1>
            </div>

            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              Contact our support team for help with appointments, payments,
              telemedicine, medical records, and other patient services.
            </p>
          </div>

          {/* CONTACT CARDS */}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Email",
                value: "support@healthcare.com",
                text: "Send us your questions anytime.",
                icon: "✉",
              },
              {
                title: "Phone",
                value: "+94 11 234 5678",
                text: "Talk to our patient support team.",
                icon: "☎",
              },
              {
                title: "Support Hours",
                value: "24/7 Available",
                text: "We’re here whenever you need help.",
                icon: "⏱",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF6FF] text-xl font-bold text-[#2477B8]">
                  {item.icon}
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#35B85A]">
                  {item.title}
                </p>

                <p className="mt-2 text-base font-bold text-[#2459A6]">
                  {item.value}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* MAIN SECTION */}
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.35fr]">
            {/* LEFT HELP */}
            <div className="rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                Quick Guidance
              </p>

              <h2 className="mt-3 text-2xl font-bold text-[#2459A6]">
                Support For Common Patient Needs
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Find quick help for the most common requests before sending your
                message.
              </p>

              <div className="mt-7 space-y-4">
                <div className="rounded-xl border border-[#D8EAF6] bg-[#F6FAFD] p-5">
                  <p className="text-base font-bold text-[#2459A6]">
                    Appointment Support
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Need help booking, rescheduling, or cancelling an
                    appointment? Our team can guide you through the process.
                  </p>
                </div>

                <div className="rounded-xl border border-[#D8EAF6] bg-[#F6FAFD] p-5">
                  <p className="text-base font-bold text-[#2459A6]">
                    Payment Assistance
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Facing a payment issue or need billing clarification? Send
                    us your details and we’ll help you resolve it.
                  </p>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <p className="text-base font-bold text-red-600">
                    Emergency Notice
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    For urgent medical situations, please contact emergency
                    services or your nearest hospital immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="rounded-2xl border border-[#D8EAF6] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                  Contact Form
                </p>

                <h2 className="mt-3 text-2xl font-bold text-[#2459A6] sm:text-3xl">
                  Send Us A Message
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Fill out the form below and our support team will get back to
                  you as soon as possible.
                </p>
              </div>

              {sent && (
                <div className="mb-5 rounded-xl border border-[#35B85A]/25 bg-[#35B85A]/10 px-4 py-3 text-sm font-semibold text-[#23823d]">
                  Message received successfully. We will contact you soon.
                </div>
              )}

              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="h-11 w-full rounded-md border border-slate-200 bg-[#F6FAFD] px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2477B8] focus:bg-white focus:ring-2 focus:ring-[#2477B8]/15"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="Enter your email address"
                      required
                      className="h-11 w-full rounded-md border border-slate-200 bg-[#F6FAFD] px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2477B8] focus:bg-white focus:ring-2 focus:ring-[#2477B8]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Enter message subject"
                    required
                    className="h-11 w-full rounded-md border border-slate-200 bg-[#F6FAFD] px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2477B8] focus:bg-white focus:ring-2 focus:ring-[#2477B8]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={7}
                    placeholder="Write your message here"
                    required
                    className="w-full resize-none rounded-md border border-slate-200 bg-[#F6FAFD] px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2477B8] focus:bg-white focus:ring-2 focus:ring-[#2477B8]/15"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-[#2477B8] px-6 text-sm font-semibold text-white transition hover:bg-[#2459A6]"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}