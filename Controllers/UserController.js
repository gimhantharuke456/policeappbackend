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

exports.register = async (req, res, next) => {
  try {
    const { fullName, officerSVC, officerRank, policeStation, Password } =
      req.body;

    console.log("Register request received:", {
      fullName,
      // passwordLength: Password.length,
      officerSVC,
      officerRank,
      policeStation,
      Password,
    });

    const successRes = await UserService.registerUser(
      fullName,
      officerSVC,
      officerRank,
      policeStation,
      Password
    );

    console.log("Registration response:", successRes);

    if (successRes.success) {
      res.status(201).json({
        status: true,
        success: successRes.message,
        data: successRes.data,
      });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { officerSVC, Password } = req.body;

    console.log("Login request:", {
      officerSVC,
      passwordProvided: !!Password,
      passwordLength: Password?.length,
    });

    const user = await UserService.checkUser(officerSVC);
    if (!user) {
      return res
        .status(401)
        .json({ status: false, error: "Invalid email or password" });
    }

    console.log("Found user, attempting password comparison");
    // Use the mongoose model's comparePassword method directly
    const isMatch = await user.comparePassword(Password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ status: false, error: "Invalid email or password" });
    }

    const tokenData = { id: user._id, officerSVC: user.officerSVC };

    const token = await UserService.genarateToken(
      tokenData,
      'JWT_SECRET',
      "48h"
    );

    console.log("Login successful, token generated");
    res.status(201).json({
      status: true,
      success: "Login successful",
      data: {
        token,
        officerSVC: user.officerSVC,
        fullName: user.fullName,
        policeStation: user.policeStation,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.verify = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const { officerSVC } = req.body;

    console.log("auth header", authHeader);
    console.log("user", officerSVC);

    const user = await UserService.checkUser("1111");
    if (!user) {
      return res.status(401).json({ status: false, error: "No User Found" });
    }

    const successRes = await UserService.authenticateToken(authHeader, next);
    console.log(successRes);

    if (successRes.success) {
      res.status(201).json({
        status: true,
        success: successRes.message,
        data: {
          officerSVC: user.officerSVC,
          fullName: user.fullName,
          policeStation: user.policeStation,
        },
      });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res
      .status(500)
      .json({ message: "Verification failed", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      officerSVC,
      fullName,
      policeStation,
      officerRank,
      contactNumber,
      email,
    } = req.body;
    console.log("Updating profile for officer:", officerSVC);

    const result = await UserService.updateProfile(
      officerSVC,
      fullName,
      policeStation,
      contactNumber,
      email,
      officerRank
    );
    if (result.success) {
      return res.status(200).json({
        status: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        status: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { email, lat, lng } = req.body;

    // Check if user exists
    const user = await UserService.checkUser(email);
    if (!user) {
      // Log detailed error for internal use
      console.error("Update Location Error: User not found");

      // Send generic error response
      return res.status(401).json({ status: false, error: "Invalid User" });
    }

    // Update the location
    const successRes = await UserService.updateUserLocation(email, lat, lng);

    // Handle the response based on the successRes
    if (successRes.success) {
      res.status(200).json({ status: true, success: successRes.message });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    // Log the error details
    console.error("Update Location Error:", error);

    // Send internal server error response
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { email, street, city, state, zip, latitude, longitude } = req.body;

    // Check if user exists
    const user = await UserService.checkUser(email);
    if (!user) {
      // Log detailed error for internal use
      console.error("Update Address Error: User not found");

      // Send generic error response
      return res.status(401).json({ status: false, error: "Invalid User" });
    }

    // Update the location
    const successRes = await UserService.UpdateUserAddress(
      email,
      street,
      city,
      state,
      zip,
      latitude,
      longitude
    );

    // Handle the response based on the successRes
    if (successRes.success) {
      res.status(200).json({ status: true, success: successRes.message });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    // Log the error details
    console.error("Update Address Error:", error);

    // Send internal server error response
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};
exports.updateUserData = async (req, res, next) => {
  try {
    const { email, name, mobile, street, city, state, zip } = req.body;
    console.log("update user");

    // Check if user exists
    const user = await UserService.checkUser(email);
    if (!user) {
      // Log detailed error for internal use
      console.error("Update Address Error: User not found");

      // Send generic error response
      return res.status(401).json({ status: false, error: "Invalid User" });
    }

    // Update the location
    const successRes = await UserService.UpdateUserData(
      email,
      name,
      mobile,
      street,
      city,
      state,
      zip
    );

    // Handle the response based on the successRes
    if (successRes.success) {
      res.status(200).json({ status: true, success: successRes.message });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    // Log the error details
    console.error("Update Address Error:", error);

    // Send internal server error response
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.getProfileDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching user profile by ID:", id);

    const result = await UserService.getUserById(id);

    if (result.success) {
      return res.status(200).json({
        status: true,
        data: result.data,
      });
    } else {
      return res.status(404).json({
        status: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error("Error in getProfileDetails:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.updateProfilePicture = async (req, res, next) => {
  upload.single("profilepicture")(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res
        .status(400)
        .json({ status: false, error: "File upload failed" });
    }

    try {
      const { email } = req.body;

      // Check if user exists
      const user = await UserService.checkUser(email);
      if (!user) {
        return res.status(401).json({ status: false, error: "Invalid User" });
      }

      // Ensure a file was uploaded
      if (!req.file) {
        return res
          .status(400)
          .json({ status: false, error: "No file uploaded" });
      }

      // Save the file path to the database
      const profilePicturePath = req.file.path;

      const successRes = await UserService.UpdateUserProfilePicture(
        email,
        profilePicturePath
      );

      if (successRes.success) {
        return res
          .status(200)
          .json({ status: true, success: successRes.message });
      } else {
        return res
          .status(400)
          .json({ status: false, error: successRes.message });
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res
        .status(500)
        .json({ status: false, error: "Internal Server Error" });
    }
  });
};
