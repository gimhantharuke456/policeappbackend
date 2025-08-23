const express = require("express");
const bodyParser = require("body-parser");
const userRoute = require("./Routes/UserRoute");
const violationsRoute = require("./Routes/ViolationRoute");
const ruleRoute = require("./Routes/RuleRoute");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const RegSVCModel = require("./Models/RegSVC");

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

// Endpoint to add dummy SVC data
app.post("/api/admin/add-svc", async (req, res) => {
  try {
    const { officerSVC, officerRank, policeStation, isActive } = req.body;

    // Validate required fields
    if (!officerSVC) {
      return res.status(400).json({
        success: false,
        message: "Officer SVC number is required",
      });
    }

    // Check if SVC already exists
    const existingSVC = await RegSVCModel.findOne({ officerSVC });
    if (existingSVC) {
      return res.status(400).json({
        success: false,
        message: "This SVC number is already registered",
      });
    }

    // Create new SVC entry
    const newSVC = new RegSVCModel({
      officerSVC,
      officerRank: officerRank || undefined,
      policeStation: policeStation || undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newSVC.save();

    return res.status(201).json({
      success: true,
      message: "SVC number added successfully",
      data: newSVC,
    });
  } catch (error) {
    console.error("Error adding SVC:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add SVC number",
      error: error.message,
    });
  }
});

// Endpoint to add multiple SVC entries at once
app.post("/api/admin/bulk-add-svc", async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of SVC entries",
      });
    }

    // Validate each entry has officerSVC
    for (const entry of entries) {
      if (!entry.officerSVC) {
        return res.status(400).json({
          success: false,
          message: "All entries must have an officerSVC number",
        });
      }
    }

    // Filter out existing SVC numbers
    const existingSVCs = await RegSVCModel.find({
      officerSVC: { $in: entries.map((e) => e.officerSVC) },
    });

    const existingSVCNumbers = existingSVCs.map((e) => e.officerSVC);

    const newEntries = entries.filter(
      (entry) => !existingSVCNumbers.includes(entry.officerSVC)
    );

    if (newEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All provided SVC numbers already exist",
      });
    }

    // Insert new entries
    const result = await RegSVCModel.insertMany(newEntries);

    return res.status(201).json({
      success: true,
      message: `Successfully added ${result.length} SVC entries`,
      skipped: entries.length - newEntries.length,
      data: result,
    });
  } catch (error) {
    console.error("Error bulk adding SVCs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add SVC entries",
      error: error.message,
    });
  }
});

// Endpoint to get all registered SVC numbers
app.get("/api/admin/list-svc", async (req, res) => {
  try {
    const svcEntries = await RegSVCModel.find({});

    return res.status(200).json({
      success: true,
      count: svcEntries.length,
      data: svcEntries,
    });
  } catch (error) {
    console.error("Error listing SVCs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve SVC entries",
      error: error.message,
    });
  }
});

// Serve static voicerecords files
// Load R2 configuration
const r2Config = require('./r2Config');

// Keep local static serving for backward compatibility
app.use("/voicerecords", express.static(path.join(__dirname, "voicerecords")));

// API route to get audio files from voicerecords folder by rule name
app.get("/api/voicerecords/:ruleName", (req, res) => {
  try {
    const { ruleName } = req.params;
    const rulePath = path.join(__dirname, "voicerecords", ruleName);

    // Check if directory exists locally (for development/fallback)
    if (!fs.existsSync(rulePath)) {
      return res.status(404).json({
        success: false,
        message: `No folder found for rule: ${ruleName}`,
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
        message: `No audio files found for rule: ${ruleName}`,
      });
    }

    // Look for the main audio file that matches the rule name
    const mainAudioFile = files.find(
      (file) =>
        file === `${ruleName}.mp3` ||
        file === `${ruleName}.wav` ||
        file === `${ruleName}.m4a`
    );

    // Function to generate R2 URL for a file
    const generateR2Url = (folderName, fileName) => {
      return `${r2Config.publicUrl}/${r2Config.baseFolderPath}/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`;
    };

    if (mainAudioFile) {
      // If main audio file exists, return it directly
      const filePath = path.join(rulePath, mainAudioFile);
      const stats = fs.statSync(filePath);
      
      return res.json({
        success: true,
        ruleName,
        mainFile: {
          filename: mainAudioFile,
          // Use R2 URL for production, fallback to local URL for development
          url: generateR2Url(ruleName, mainAudioFile),
          localUrl: `${req.protocol}://${req.get("host")}/voicerecords/${encodeURIComponent(ruleName)}/${encodeURIComponent(mainAudioFile)}`,
          size: stats.size,
          type: path.extname(mainAudioFile).substring(1),
        },
        allFiles: files.map((filename) => {
          const fileStats = fs.statSync(path.join(rulePath, filename));
          return {
            filename,
            // Use R2 URL for production, fallback to local URL for development
            url: generateR2Url(ruleName, filename),
            localUrl: `${req.protocol}://${req.get("host")}/voicerecords/${encodeURIComponent(ruleName)}/${encodeURIComponent(filename)}`,
            size: fileStats.size,
            type: path.extname(filename).substring(1),
            isMainFile: filename === mainAudioFile,
          };
        }),
      });
    } else {
      // If no main file, return the first audio file found
      const firstAudioFile = files[0];
      const filePath = path.join(rulePath, firstAudioFile);
      const stats = fs.statSync(filePath);
      
      return res.json({
        success: true,
        ruleName,
        mainFile: {
          filename: firstAudioFile,
          // Use R2 URL for production, fallback to local URL for development
          url: generateR2Url(ruleName, firstAudioFile),
          localUrl: `${req.protocol}://${req.get("host")}/voicerecords/${encodeURIComponent(ruleName)}/${encodeURIComponent(firstAudioFile)}`,
          size: stats.size,
          type: path.extname(firstAudioFile).substring(1),
        },
        allFiles: files.map((filename) => {
          const fileStats = fs.statSync(path.join(rulePath, filename));
          return {
            filename,
            // Use R2 URL for production, fallback to local URL for development
            url: generateR2Url(ruleName, filename),
            localUrl: `${req.protocol}://${req.get("host")}/voicerecords/${encodeURIComponent(ruleName)}/${encodeURIComponent(filename)}`,
            size: fileStats.size,
            type: path.extname(filename).substring(1),
            isMainFile: filename === firstAudioFile,
          };
        }),
      });
    }
  } catch (error) {
    console.error(
      `Error getting audio files for rule ${req.params.ruleName}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: `Failed to fetch audio files for rule: ${req.params.ruleName}`,
      error: error.message,
    });
  }
});

// API route to list all available voicerecords folders
app.get("/api/voicerecords", (req, res) => {
  try {
    const voicerecordsPath = path.join(__dirname, "voicerecords");
    const folders = fs
      .readdirSync(voicerecordsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        const folderPath = path.join(voicerecordsPath, dirent.name);
        const audioFiles = fs
          .readdirSync(folderPath)
          .filter(
            (file) =>
              file.endsWith(".mp3") ||
              file.endsWith(".wav") ||
              file.endsWith(".m4a")
          );
        
        // Find main audio file if it exists
        const mainAudioFile = audioFiles.find(
          (file) =>
            file === `${dirent.name}.mp3` ||
            file === `${dirent.name}.wav` ||
            file === `${dirent.name}.m4a`
        );
        
        // Generate R2 URL for main file if it exists
        let mainFileUrl = null;
        if (mainAudioFile) {
          mainFileUrl = `${r2Config.publicUrl}/${r2Config.baseFolderPath}/${encodeURIComponent(dirent.name)}/${encodeURIComponent(mainAudioFile)}`;
        }
        
        return {
          name: dirent.name,
          audioFileCount: audioFiles.length,
          hasMainFile: !!mainAudioFile,
          mainFileUrl: mainFileUrl,
          r2FolderUrl: `${r2Config.publicUrl}/${r2Config.baseFolderPath}/${encodeURIComponent(dirent.name)}/`,
          localFolderUrl: `${req.protocol}://${req.get("host")}/voicerecords/${encodeURIComponent(dirent.name)}/`
        };
      });

    res.json({
      success: true,
      folders: folders,
      totalFolders: folders.length,
      baseR2Url: `${r2Config.publicUrl}/${r2Config.baseFolderPath}/`,
      baseLocalUrl: `${req.protocol}://${req.get("host")}/voicerecords/`
    });
  } catch (error) {
    console.error("Error listing voicerecords folders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch voicerecords folders",
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
