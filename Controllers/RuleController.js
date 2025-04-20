const UserService = require("../Services/UserService");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage: storage, dest: "uploads/" });

exports.alltracks = async (req, res, next) => {
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
};
