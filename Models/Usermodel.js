const mongoose = require("mongoose");
const db = require("../Config/DBconfig");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const officerSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  officerSVC: {
    type: String,
    required: true,
    unique: true,
  },
  officerRank: {
    type: String,
    required: true,
  },
  policeStation: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  // Optional fields for future implementation
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  phone: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to hash password
officerSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("Password")) {
      console.log("Password not modified, skipping hash");
      return next();
    }

    console.log("Pre-save: Original password:", this.Password);
    const salt = await bcrypt.genSalt(10);
    console.log("Pre-save: Generated salt:", salt);
    const hashedPassword = await bcrypt.hash(this.Password, salt);
    console.log("Pre-save: Generated hash:", hashedPassword);
    this.Password = hashedPassword;
    next();
  } catch (error) {
    console.error("Pre-save error:", error);
    next(error);
  }
});

// Method to compare password for login
officerSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("comparePassword method called");
    console.log("Candidate password:", candidatePassword);
    console.log("Stored hash:", this.Password);

    const isMatch = await bcrypt.compare(candidatePassword, this.Password);
    console.log("Password comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("comparePassword error:", error);
    throw error;
  }
};

// Pre-update middleware to update the updatedAt timestamp
officerSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const OfficerModel = db.model("officer", officerSchema);
module.exports = OfficerModel;
