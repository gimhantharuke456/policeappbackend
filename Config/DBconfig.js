const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const connection = mongoose
  .createConnection(process.env.MONGODB_CONNECTION_LINK, {
    tlsAllowInvalidCertificates: true,
  })
  .on("open", () => {
    console.log("MongoDB Connected");
  })
  .on("error", (err) => {
    console.error("MongoDB Connection error:", err);
  });

module.exports = connection;

// const mongoose = require("mongoose");
// require("dotenv").config();

// // Check if environment variable exists
// const MONGODB_URI = process.env.MONGODB_CONNECTION_LINK;
// if (!MONGODB_URI) {
//   console.error("MONGODB_CONNECTION_LINK environment variable is not set");
//   process.exit(1); // Exit with error
// }

// // Use connect instead of createConnection for simpler management
// const connectDB = async () => {
//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log("MongoDB Connected");
//     return mongoose.connection;
//   } catch (error) {
//     console.error("MongoDB Connection error:", error);
//     process.exit(1);
//   }
// };

// module.exports = connectDB();
