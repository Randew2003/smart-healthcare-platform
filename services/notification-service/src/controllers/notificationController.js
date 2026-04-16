import { sendEmail } from "../services/emailService.js";

export const handleNotificationEvent = async (req, res) => {
  try {
    const event = req.body;

    console.log("Received event:", event);

    // TEMP test email
    await sendEmail(
      "your_email@gmail.com", // put your real email
      "Test Notification",
      "Notification service is working!"
    );

    res.status(200).json({
      message: "Notification processed and email sent"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};