import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { initTwilio } from "./services/smsService.js";

// Initialize Twilio AFTER env is loaded
initTwilio();

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});