import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";
import { submitPayHereCheckout } from "../../utils/payhereCheckout";

function timeToMinutes(timeValue) {
  if (!/^\d{2}:\d{2}$/.test(String(timeValue || ""))) return null;

  const [hours, minutes] = String(timeValue).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const safeMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function buildGeneratedTimeSlots(startTime, endTime, slotCount = 10) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || slotCount <= 0) {
    return [];
  }

  const normalizedEndMinutes = endMinutes <= startMinutes ? endMinutes + (24 * 60) : endMinutes;
  const totalMinutes = normalizedEndMinutes - startMinutes;

  if (totalMinutes <= 0) {
    return [];
  }

  const slotDuration = totalMinutes / slotCount;

  return Array.from({ length: slotCount }, (_, index) => {
    const slotStart = Math.round(startMinutes + (slotDuration * index));
    const slotEnd = Math.round(startMinutes + (slotDuration * (index + 1)));

    return {
      index: index + 1,
      startTime: minutesToTime(slotStart),
      endTime: minutesToTime(slotEnd)
    };
  });
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const doctorIdFromQuery = searchParams.get("doctorId") || "";

  const user = getUser();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const latestAvailabilityRequestRef = useRef(0);

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
      doctorId: doctorIdFromQuery,
      date: "",
      time: ""
    }));
  }, [doctorIdFromQuery]);

  const appointmentFee = 1500;
  const selectedDoctor = doctors.find((doctor) => String(doctor?._id) === String(form.doctorId));
  const selectedAvailability = availability.find((slot) => slot.date === form.date) || null;
  const availableDates = availability.map((slot) => slot.date).sort();
  const availableTimeSlots = selectedAvailability?.generatedTimeSlots || [];
  const remainingCount = selectedAvailability?.remainingCount ?? 0;

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
    if (!form.doctorId) {
      latestAvailabilityRequestRef.current += 1;
      setAvailability([]);
      setAvailabilityMessage("");
      setForm((prev) => ({ ...prev, date: "", time: "" }));
      return;
    }

    const fetchAvailability = async () => {
      const requestId = latestAvailabilityRequestRef.current + 1;
      latestAvailabilityRequestRef.current = requestId;

      try {
        setLoading(true);
        setAvailability([]);
        setAvailabilityMessage("");

        const res = await api.get(`/api/doctors/${form.doctorId}/availability`);
        if (latestAvailabilityRequestRef.current !== requestId) return;

        const doctor = res.data.data;
        const slots = Array.isArray(doctor?.availability) ? doctor.availability : [];
        const openSlots = slots
          .map((slot) => ({
            ...slot,
            generatedTimeSlots: Array.isArray(slot.generatedTimeSlots) && slot.generatedTimeSlots.length > 0
              ? slot.generatedTimeSlots
              : buildGeneratedTimeSlots(slot.startTime, slot.endTime, 10)
          }))
          .filter((slot) => !slot.isBooked);

        setAvailability(openSlots);
        setForm((prev) => {
          const hasSelectedDate = openSlots.some((slot) => slot.date === prev.date);
          return {
            ...prev,
            date: hasSelectedDate ? prev.date : "",
            time: hasSelectedDate ? prev.time : ""
          };
        });

        if (openSlots.length === 0) {
          setAvailabilityMessage("This doctor has no open dates right now.");
        }
      } catch (err) {
        if (latestAvailabilityRequestRef.current !== requestId) return;
        console.log("Availability fetch error:", err.message);
        setAvailability([]);
        setAvailabilityMessage("Failed to load doctor availability.");
      } finally {
        if (latestAvailabilityRequestRef.current === requestId) {
          setLoading(false);
        }
      }
    };

    fetchAvailability();
  }, [form.doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "doctorId") {
        updated.date = "";
        updated.time = "";
      }

      return updated;
    });

    if (name === "doctorId") {
      latestAvailabilityRequestRef.current += 1;
      setAvailability([]);
      setAvailabilityMessage("");
    }
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
              <p className="text-xs font-bold uppercase tracking-wide text-[#35B85A]">
                Appointment
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#2459A6]">
                Book Your Appointment
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Select a doctor, choose an available date, then pick one of the 10 equal times from the doctor's 6-hour session.
              </p>
            </div>

            <div className="mt-5 space-y-5">
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

                {selectedDoctor ? (
                  <div className="mt-4 rounded-xl bg-[#F6FAFD] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-[#2459A6]">
                          Dr. {selectedDoctor.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {selectedDoctor.specialization || "Specialist"}
                        </p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {availability.length} date{availability.length === 1 ? "" : "s"} available
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Select Date</p>
                {loading ? (
                  <div className="mt-2 rounded-xl border border-dashed border-[#D8EAF6] px-4 py-5 text-sm text-slate-500">
                    Loading available dates...
                  </div>
                ) : availableDates.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-dashed border-[#D8EAF6] px-4 py-5 text-sm text-slate-500">
                    {availabilityMessage || "Select a doctor to see availability."}
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {availableDates.map((date) => {
                      const isSelected = form.date === date;

                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, date, time: "" }))}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            isSelected
                              ? "border-[#2459A6] bg-[#2459A6] text-white"
                              : "border-[#D8EAF6] bg-[#F6FAFD] text-slate-800 hover:border-[#2459A6]"
                          }`}
                        >
                          <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                            Available Date
                          </div>
                          <div className="mt-1 text-sm font-bold">
                            {formatDisplayDate(date)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Select Time</p>
                {!form.date ? (
                  <div className="mt-2 rounded-xl border border-dashed border-[#D8EAF6] px-4 py-5 text-sm text-slate-500">
                    Select a date first to view the 10 equal appointment times.
                  </div>
                ) : (
                  <>
                    <div className="mt-2 rounded-xl bg-[#F6FAFD] p-4 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">{remainingCount}</span> of 10 patient booking spots left for this 6-hour doctor session.
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {availableTimeSlots.map((slot) => {
                        const isSelected = form.time === slot.startTime;
                        const isBooked = Array.isArray(selectedAvailability?.bookedTimes) &&
                          selectedAvailability.bookedTimes.includes(slot.startTime);

                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setForm((prev) => ({ ...prev, time: slot.startTime }))}
                            className={`rounded-xl border px-4 py-3 text-left transition ${
                              isBooked
                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                : isSelected
                                ? "border-[#35B85A] bg-[#35B85A] text-white"
                                : "border-[#D8EAF6] bg-white text-slate-800 hover:border-[#35B85A]"
                            }`}
                          >
                            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                              {isBooked ? "Booked" : `Slot ${slot.index}`}
                            </div>
                            <div className="mt-1 text-sm font-bold">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

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

              <div className="rounded-2xl border border-[#D8EAF6] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Consultation Fee</p>
                <p className="mt-2 text-lg font-bold text-[#2459A6]">
                  LKR {appointmentFee}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  After booking, you will be redirected to PayHere to complete the payment.
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`${
                    submitting
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  } inline-flex w-full items-center justify-center rounded-lg bg-[#2459A6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4a8a] sm:w-auto`}
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
