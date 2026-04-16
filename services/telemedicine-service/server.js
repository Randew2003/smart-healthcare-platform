require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 4006;

// Connect to MongoDB
connectDB();

// Start Express server
app.listen(PORT, () => {
  console.log(`Telemedicine Service running on port ${PORT}`);
});