import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-[170px]">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Contact</h1>
          <p className="mt-2 text-sm text-slate-600">
            Need help? Send us a message.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-extrabold text-slate-800">Support</div>
              <div className="mt-2 text-sm text-slate-600">support@healthcare.com</div>
              <div className="mt-2 text-sm text-slate-600">+94 11 234 5678</div>
              <div className="mt-2 text-sm text-slate-600">24/7 Support</div>

              <div className="mt-6 rounded-xl border border-[#80c342]/25 bg-[#80c342]/10 p-4">
                <div className="text-xs font-extrabold text-[#2f6b14]">Note</div>
                <div className="mt-1 text-sm text-slate-700">
                  For urgent medical situations, contact your nearest emergency service.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              {sent ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  Message received. We will contact you soon.
                </div>
              ) : null}

              <form onSubmit={submit} className="mt-2 grid gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-1 inline-flex items-center justify-center rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421]"
                >
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
