import { sendEmail } from "../services/emailService.js";
import { sendSMS } from "../services/smsService.js";

export const handleNotificationEvent = async (req, res) => {
  try {
    const event = req.body;

    console.log("Received event:", event);

    const { type, patient, doctor, appointmentTime } = event;

    let subject = "";
    let message = "";

    // 🧠 Event-based logic
    if (type === "APPOINTMENT_BOOKED") {
      subject = "Appointment Confirmed";
      message = `Your appointment is confirmed for ${appointmentTime}`;
    } else if (type === "CONSULTATION_COMPLETED") {
      subject = "Consultation Completed";
      message = "Your consultation has been completed successfully.";
    } else {
      subject = "Notification";
      message = "You have a new update.";
    }

    // 📧 Send to patient
    if (patient?.email) {
      await sendEmail(patient.email, subject, message);
    }

    // 📧 Send to doctor
    if (doctor?.email) {
      await sendEmail(doctor.email, subject, message);
    }

    // 📱 SMS
    if (patient?.phone) {
      await sendSMS(patient.phone, message);
    }

    if (doctor?.phone) {
      await sendSMS(doctor.phone, message);
    }

    res.status(200).json({
      message: "Notifications sent successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};