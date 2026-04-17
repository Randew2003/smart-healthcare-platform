import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { syncAllDoctorsToDoctorService } from "./utils/doctorServiceSync.js";

const PORT = process.env.PORT || 4000;

await connectDB(process.env.MONGODB_URI);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Best-effort background sync so doctor-service has doctor profiles for patient listing.
  syncAllDoctorsToDoctorService()
    .then((result) => {
      console.log(
        `Doctor-service sync completed: total=${result.total}, synced=${result.synced}, skipped=${result.skipped}`
      );
    })
    .catch((error) => {
      console.warn(`Doctor-service sync failed: ${error?.message || error}`);
    });
});
