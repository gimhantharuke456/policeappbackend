// // app.js
// var multer = require("multer");
// const express = require("express");
// const bodyParser = require("body-parser");
// const userRoute = require("./Routes/UserRoute");
// const violationsRoute = require("./Routes/ViolationRoute");

// const cors = require("cors");

// const app = express();

// const corsOptions = {
//   origin: "http://localhost:3000",
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + "-" + Date.now());
//   },
// });

// var upload = multer({ storage: storage });

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// app.use(express.json());
// app.use("/", userRoute);
// app.use("/violations", violationsRoute);

// module.exports = app;

const express = require("express");
const bodyParser = require("body-parser");
const userRoute = require("./Routes/UserRoute");
const violationsRoute = require("./Routes/ViolationRoute");
const cors = require("cors");
const path = require("path");

const app = express();

// Allow requests from your production frontend and localhost during development
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, "https://your-frontend-domain.vercel.app"]
      : "http://localhost:3000",
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// Routes
app.use("/", userRoute);
app.use("/violations", violationsRoute);

// For static files - but note this won't work as expected in serverless
// Consider using S3 or another cloud storage service instead
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
