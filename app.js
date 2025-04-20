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
const ruleRoute = require("./Routes/RuleRoute");
const cors = require("cors");
const path = require("path");
const fs = require('fs');

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

app.use("/tracks", express.static(path.join(__dirname, "tracks")));

// API route to list available track folders
app.get("/api/tracks", (req, res) => {
  try {
    const tracksPath = path.join(__dirname, "tracks");
    const folders = fs
      .readdirSync(tracksPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    res.json({
      success: true,
      folders: folders,
    });
  } catch (error) {
    console.error("Error listing track folders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch track folders",
      error: error.message,
    });
  }
});

// API route to get files in a specific rule folder
app.get("/api/tracks/:ruleNumber", (req, res) => {
  try {
    const { ruleNumber } = req.params;
    const rulePath = path.join(__dirname, "tracks", ruleNumber);

    // Check if directory exists
    if (!fs.existsSync(rulePath)) {
      return res.status(404).json({
        success: false,
        message: `No folder found for rule ${ruleNumber}`,
      });
    }

    // Get all audio files in the folder
    const files = fs
      .readdirSync(rulePath)
      .filter(
        (file) =>
          file.endsWith(".mp3") ||
          file.endsWith(".wav") ||
          file.endsWith(".m4a")
      );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No audio files found for rule ${ruleNumber}`,
      });
    }

    // Format the response
    const audioFiles = files.map((filename) => {
      // Calculate file size
      const stats = fs.statSync(path.join(rulePath, filename));

      return {
        filename,
        url: `${req.protocol}://${req.get(
          "host"
        )}/tracks/${ruleNumber}/${filename}`,
        size: stats.size,
        isMainFile: filename.startsWith(`${ruleNumber}.`),
      };
    });

    // Sort files (main file first)
    audioFiles.sort((a, b) => {
      if (a.isMainFile && !b.isMainFile) return -1;
      if (!a.isMainFile && b.isMainFile) return 1;
      return a.filename.localeCompare(b.filename);
    });

    res.json({
      success: true,
      ruleNumber,
      files: audioFiles,
    });
  } catch (error) {
    console.error(
      `Error getting audio files for rule ${req.params.ruleNumber}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: `Failed to fetch audio files for rule ${req.params.ruleNumber}`,
      error: error.message,
    });
  }
});

// Routes
app.use("/", userRoute);
app.use("/violations", violationsRoute);
// app.use("/tracks", ruleRoute);

// For static files - but note this won't work as expected in serverless
// Consider using S3 or another cloud storage service instead
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
