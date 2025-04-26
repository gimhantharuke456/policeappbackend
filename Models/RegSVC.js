const mongoose = require("mongoose");
const db = require("../Config/DBconfig");

const { Schema } = mongoose;

const regSVCSchema = new Schema({
  officerSVC: {
    type: String,
    required: true,
    unique: true,
  },
  officerRank: {
    type: String,
    required: false,
  },
  policeStation: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
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
regSVCSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const RegSVCModel = db.model("regsvc", regSVCSchema);
module.exports = RegSVCModel;
