require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 4005;

connectDB();

app.listen(PORT, () => {
  console.log(`Doctor Service running on port ${PORT}`);
});