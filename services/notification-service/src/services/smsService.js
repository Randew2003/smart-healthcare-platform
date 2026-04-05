import twilio from "twilio";

let client;

export const initTwilio = () => {
  client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

export const sendSMS = async (to, message) => {
  try {
    if (!client) {
      throw new Error("Twilio not initialized");
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to
    });

    console.log("SMS sent:", response.sid);
  } catch (error) {
    console.error("SMS error:", error.message);
    throw error;
  }
};