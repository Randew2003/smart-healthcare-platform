import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import contactBanner from "../../assets/patientassets/contactus.png";

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
      <section className="bg-[#f5fbff]">
        {/* Banner */}
        <div className="w-full overflow-hidden">
          <div className="h-[220px] sm:h-[260px] lg:h-[300px]">
            <img
              src={contactBanner}
              alt="Contact Us Banner"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          {/* Intro */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">
              Patient Support
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-[#02539d] sm:text-4xl">
              We’re Here to Help You
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Contact our support team for help with appointments, payments,
              telemedicine, and other patient services.
            </p>
          </div>

          {/* Quick contact cards */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-[#d9edf9] bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0070cd]/10 text-[#0070cd]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V8.25m18 0L12 13.5 3 8.25m18 0L18.75 6H5.25L3 8.25"
                  />
                </svg>
              </div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0070cd]">
                Email
              </p>
              <p className="mt-2 text-base font-bold text-slate-800">
                support@healthcare.com
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Send us your questions anytime.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#d9edf9] bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00bbb3]/10 text-[#00bbb3]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 7.456 6.044 13.5 13.5 13.5h2.25A2.25 2.25 0 0 0 20.25 18v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a11.122 11.122 0 0 1-5.67-5.67l1.293-.97c.363-.272.525-.742.417-1.173L7.713 4.852A1.125 1.125 0 0 0 6.622 4.0H5.25A2.25 2.25 0 0 0 3 6.25v.5Z"
                  />
                </svg>
              </div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0070cd]">
                Phone
              </p>
              <p className="mt-2 text-base font-bold text-slate-800">
                +94 11 234 5678
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Talk to our patient support team.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#d9edf9] bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#02539d]/10 text-[#02539d]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
                  />
                </svg>
              </div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0070cd]">
                Support Hours
              </p>
              <p className="mt-2 text-base font-bold text-slate-800">
                24/7 Available
              </p>
              <p className="mt-1 text-sm text-slate-500">
                We’re here whenever you need help.
              </p>
            </div>
          </div>

          {/* Main section */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
            {/* Left */}
            <div className="rounded-[28px] border border-[#d9edf9] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-[#02539d]">
                Quick Help & Guidance
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Find support for common patient needs before sending your
                message.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-[#00bbb3]/20 bg-[#00bbb3]/8 p-5">
                  <p className="text-base font-bold text-[#0070cd]">
                    Appointment Support
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Need help booking, rescheduling, or cancelling an
                    appointment? Our team is ready to assist you quickly.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#0070cd]/12 bg-[#0070cd]/5 p-5">
                  <p className="text-base font-bold text-[#0070cd]">
                    Payment Assistance
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Facing a payment issue or need billing clarification? Send
                    us your details and we’ll help you resolve it.
                  </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
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

            {/* Right */}
            <div className="rounded-[28px] border border-[#d9edf9] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#02539d] sm:text-3xl">
                  Send Us a Message
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Fill out the form below and our support team will get back to
                  you as soon as possible.
                </p>
              </div>

              {sent && (
                <div className="mb-5 rounded-2xl border border-[#00bbb3]/20 bg-[#00bbb3]/10 px-4 py-3 text-sm font-semibold text-[#007c76]">
                  Message received successfully. We will contact you soon.
                </div>
              )}

              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#00bbb3] focus:ring-4 focus:ring-[#00bbb3]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Email Address
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="Enter your email address"
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#00bbb3] focus:ring-4 focus:ring-[#00bbb3]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Subject
                  </label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Enter message subject"
                    required
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#00bbb3] focus:ring-4 focus:ring-[#00bbb3]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Write your message here"
                    required
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#00bbb3] focus:ring-4 focus:ring-[#00bbb3]/10"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-2xl bg-[#0070cd] px-6 text-sm font-extrabold text-white transition hover:bg-[#02539d]"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}