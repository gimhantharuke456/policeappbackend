const mongoose = require("mongoose");


const connection = mongoose
  .createConnection('mongodb+srv://sasithmjayaweera:IvGxzDZnpL7G5hPI@cluster0.y619q5m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    tlsAllowInvalidCertificates: true,
  })
  .on("open", () => {
    console.log("MongoDB Connected");
  })
  .on("error", (err) => {
    console.error("MongoDB Connection error:", err);
  });

module.exports = connection;
