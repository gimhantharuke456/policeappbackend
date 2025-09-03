const mongoose = require("mongoose");
const db = require("../Config/DBconfig");


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


// Pre-update middleware to update the updatedAt timestamp
officerSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const OfficerModel = db.model("officer", officerSchema);
module.exports = OfficerModel;
