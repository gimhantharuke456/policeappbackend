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
