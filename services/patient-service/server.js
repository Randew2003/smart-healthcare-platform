import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Patient Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start patient service:", error.message);
    process.exit(1);
  }
}

startServer();