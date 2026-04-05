import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});