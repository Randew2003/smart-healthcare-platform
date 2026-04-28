import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "./../../layouts/MainLayout";
import { api } from "./../../utils/api";
import { getUser, isLoggedIn } from "./../../utils/auth";
import { submitPayHereCheckout } from "./../../utils/payhereCheckout";

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const doctorIdFromQuery = searchParams.get("doctorId") || "";

  const user = getUser();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);

  const [form, setForm] = useState({
    patientId: user?.id || user?._id || "PATIENT123",
    doctorId: doctorIdFromQuery,
    date: "",
    time: "",
    notes: "",
    patientEmail: user?.email || "",
    patientPhone: user?.phone || ""
  });

  useEffect(() => {
    if (!doctorIdFromQuery) return;
    setForm((prev) => ({
      ...prev,
      doctorId: prev.doctorId || doctorIdFromQuery
    }));
  }, [doctorIdFromQuery]);

  const appointmentFee = 1500;

  // 🔥 fetch doctors (from doctor service)
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/api/doctors");
        setDoctors(res.data.data || []);
      } catch (err) {
        console.log("Doctor fetch error:", err.message);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {

    console.log("Doctor ID changed:", form.doctorId);
    if (!form.doctorId) {
      setAvailability([]);
      setAvailableDates([]);
      setAvailableTimes([]);
      setForm(prev => ({ ...prev, date: "", time: "" }));
      return;
    }

  const fetchAvailability = async () => {
    try {
      const res = await api.get(`/api/doctors/${form.doctorId}/availability`);
      const doctor = res.data.data;
      console.log("API CALLED ✅");

      console.log("Doctor availability:", doctor.availability);

      const avail = doctor.availability || [];
      setAvailability(avail);

      // Extract unique available dates
      const dates = [...new Set(avail.filter(slot => !slot.isBooked).map(slot => slot.date))].sort();
      setAvailableDates(dates);
    } catch (err) {
      console.log("Availability fetch error:", err.message);
      setAvailability([]);
      setAvailableDates([]);
    }
  };

    fetchAvailability();
  }, [form.doctorId]);


  useEffect(() => {
  if (!form.date) {
    setAvailableTimes([]);
    return;
  }

  const slots = availability.filter(
    (slot) =>
      slot.date === form.date && slot.isBooked === false
  );

  // convert slots → time list
  const times = slots.map((slot) => slot.startTime);

  setAvailableTimes(times);
 }, [form.date, availability]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'date') {
        updated.time = "";
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!form.doctorId || !form.date || !form.time || !form.patientEmail || !form.patientPhone) {
      alert("Please fill all required fields");
      return;
    }

    if (!isLoggedIn()) {
      alert("Please login to book and pay for your appointment.");
      return;
    }

    try {
      setSubmitting(true);

      const appointmentResponse = await api.post("/api/appointments", form);
      const appointment = appointmentResponse.data?.appointment || appointmentResponse.data;

      if (!appointment?._id) {
        throw new Error("Appointment creation failed.");
      }

      const paymentResponse = await api.post("/api/payments", {
        appointmentId: appointment._id,
        amount: appointmentFee,
        fullName: user?.fullName || "",
        email: form.patientEmail,
        phone: form.patientPhone
      });

      submitPayHereCheckout(paymentResponse.data?.payhere);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <section className="min-h-screen bg-[#F6FAFD] px-6 py-8 text-slate-800 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-[#D8EAF6] bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#35B85A]">
                  Appointment
                </p>
                <h1 className="mt-1 text-2xl font-bold text-[#2459A6]">
                  Book Your Appointment
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Select a doctor, choose a date and time, and confirm your visit.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {/* Doctor Selection */}
              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Select Doctor</p>
                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-[#D8EAF6] bg-white px-4 py-2 text-sm text-slate-900 outline-none"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Select Date</p>
                <select
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-[#D8EAF6] bg-white px-4 py-2 text-sm text-slate-900 outline-none"
                >
                  <option value="">-- Select Date --</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Select Time</p>
                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-[#D8EAF6] bg-white px-4 py-2 text-sm text-slate-900 outline-none"
                >
                  <option value="">-- Select Time --</option>
                  {availableTimes.map((t, index) => (
                    <option key={index} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Your Email</p>
                <input
                  type="email"
                  name="patientEmail"
                  value={form.patientEmail}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-2 w-full rounded-lg border border-[#D8EAF6] bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>

              {/* Phone */}
              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Your Phone</p>
                <input
                  type="tel"
                  name="patientPhone"
                  value={form.patientPhone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="mt-2 w-full rounded-lg border border-[#D8EAF6] bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>

              {/* Reason */}
              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Reason for Visit</p>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Describe your symptoms or reason..."
                  className="mt-2 w-full min-h-[100px] rounded-lg border border-[#D8EAF6] bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>

              {/* Consultation Fee */}
              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Consultation Fee</p>
                <p className="mt-2 text-lg font-bold text-[#2459A6]">
                  LKR {appointmentFee}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  After booking, you will be redirected to PayHere to complete the payment.
                </p>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`${
                    submitting
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  } inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-[#2459A6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4a8a]"`}
                >
                  {submitting ? "Processing payment..." : "Book & Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
