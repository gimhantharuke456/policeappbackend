const mongoose = require("mongoose");
const db = require("../Config/DBconfig");
const { Schema } = mongoose;

// Tourist Schema
const touristSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  passport: {
    type: String,
    required: true,
    trim: true
  },
  country: {  // Corrected from 'county' in the data
    type: String,
    required: true,
    trim: true
  },
  id: {
    type: String,
    required: true,
    trim: true
  }
});

// Violation Schema
const violationSchema = new Schema({
  // Tourist information
  tourist: {
    type: touristSchema,
    required: true
  },
  
  // Violation details
  violation: {
    type: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: String,
      required: true,
      trim: true
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    fine: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Officer information
  officer: {
    id: {
      type: String,
      ref: 'officer',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Reference number for the violation
  referenceNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  timestamp: {
    type: String,
    required: true
  }
});

// Pre-save middleware to generate a reference number
violationSchema.pre("save", async function(next) {
  if (!this.referenceNumber) {
    // Generate a unique reference number (you can customize this)
    // Format: VIO-YYYYMMDD-XXXX (where XXXX is a random number)
    const date = new Date();
    const dateStr = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    this.referenceNumber = `VIO-${dateStr}-${randomNum}`;
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
violationSchema.pre("findOneAndUpdate", function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Create virtual for formatted date
violationSchema.virtual('formattedDate').get(function() {
  return new Date(this.createdAt).toLocaleDateString();
});

// Static method to find violations by tourist passport
violationSchema.statics.findByPassport = function(passport) {
  return this.find({ 'tourist.passport': passport });
};

// Static method to find violations by officer
violationSchema.statics.findByOfficer = function(officerId) {
  return this.find({ 'officer.id': officerId });
};

// Export the model
const ViolationModel = db.model("violation", violationSchema);
module.exports = ViolationModel;