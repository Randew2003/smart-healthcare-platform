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
      <div className="px-4 pb-16 max-w-[1200px] mx-auto">
        <div className="bg-[linear-gradient(135deg,rgba(128,195,66,0.16),rgba(251,176,51,0.14))] border border-[rgba(128,195,66,0.15)] rounded-[18px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <h2 className="m-0 text-2xl text-slate-900">Book Your Appointment</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Select a doctor, choose a date and time, and confirm your visit.</p>
        </div>

        {/* GRID */}
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          
          {/* DOCTOR SELECT */}
          <div className="bg-white p-5 rounded-[18px] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-base text-slate-900">Select Doctor</h3>

            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[12px] border border-slate-200 bg-white text-sm outline-none"
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div className="bg-white p-5 rounded-[18px] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-base text-slate-900">Select Date</h3>

            <select
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[12px] border border-slate-200 bg-white text-sm outline-none"
            >
              <option value="">-- Select Date --</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* TIME */}
          <div className="bg-white p-5 rounded-[18px] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-base text-slate-900">Select Time</h3>

            <select
             name="time"
             value={form.time}
             onChange={handleChange}
             className="w-full px-4 py-3 rounded-[12px] border border-slate-200 bg-white text-sm outline-none"
            >
          <option value="">-- Select Time --</option>
           {availableTimes.map((t, index) => (
           <option key={index} value={t}>
           {t}
          </option>
         ))}
         </select>
        </div>

          {/* EMAIL */}
          <div className="bg-white p-5 rounded-[18px] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-base text-slate-900">Your Email</h3>

            <input
              type="email"
              name="patientEmail"
              value={form.patientEmail}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-[12px] border border-slate-200 bg-white text-sm outline-none"
            />
          </div>

          {/* PHONE */}
          <div className="bg-white p-5 rounded-[18px] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-base text-slate-900">Your Phone</h3>

            <input
              type="tel"
              name="patientPhone"
              value={form.patientPhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 rounded-[12px] border border-slate-200 bg-white text-sm outline-none"
            />
          </div>

          {/* REASON */}
          <div className="sm:col-span-2 bg-white p-5 rounded-[18px] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-base text-slate-900">Reason for Visit</h3>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Describe your symptoms or reason..."
              className="w-full min-h-[120px] px-4 py-3 rounded-[12px] border border-slate-200 bg-white text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Consultation fee: <span className="font-semibold text-slate-900">LKR {appointmentFee}</span>
            <div className="mt-2">After booking, you will be redirected to PayHere to complete the payment.</div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`${submitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"} inline-flex w-full sm:w-auto items-center justify-center rounded-[12px] px-4 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] bg-gradient-to-r from-[#80c342] to-[#fbb033]`}
            >
              {submitting ? "Processing payment..." : "Book & Pay Now"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
