const Violation = require("../Models/Violationmodel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

class ViolationService {
  
  static async addViolation(tourist, violation, officer, timestamp) {
    console.log(tourist);
    try {
      // Validate required fields
      if (
        !tourist.name ||
        !tourist.passport ||
        !tourist.country ||
        !tourist.id
      ) {
        return { success: false, message: "Tourist information is incomplete" };
      }

      if (
        !violation.type ||
        !violation.date ||
        !violation.time ||
        !violation.location ||
        !violation.fine
      ) {
        return { success: false, message: "Violation details are incomplete" };
      }

      if (!officer.id || !officer.name) {
        return { success: false, message: "Officer information is incomplete" };
      }

      const date = new Date();
      const dateStr =
        date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, "0") +
        String(date.getDate()).padStart(2, "0");
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number

      // Create a new violation record
      const newViolation = new Violation({
        tourist,
        violation,
        officer,
        timestamp: timestamp || new Date().toISOString(),
        referenceNumber: `VIO-${dateStr}-${randomNum}`,
      });

      // Save the violation to the database
      const savedViolation = await newViolation.save();

      return {
        success: true,
        message: "Violation recorded successfully",
        data: savedViolation,
      };
    } catch (error) {
      console.error("Error in addViolation service:", error);
      return { success: false, message: error.message };
    }
  }

  static async getViolations(
    id = null,
    touristName = null,
    touristPassport = null,
    touristCountry = null,
    violationType = null,
    violationDate = null,
    officerId = null,
    status = null
  ) {
    try {
      // Build query conditions
      const query = {};

      if (id) {
        query._id = id;
      }

      if (touristName) {
        query["tourist.name"] = { $regex: touristName, $options: "i" };
      }

      if (touristPassport) {
        query["tourist.passport"] = touristPassport;
      }

      if (touristCountry) {
        query["tourist.country"] = touristCountry;
      }

      if (violationType) {
        query["violation.type"] = violationType;
      }

      if (violationDate) {
        query["violation.date"] = violationDate;
      }

      if (officerId) {
        query["officer.id"] = officerId;
      }

      if (status) {
        query.status = status;
      }

      // Execute query
      const violations = await Violation.find(query)
        .sort({ createdAt: -1 })
        .lean();

      const total = await Violation.countDocuments(query);

      return {
        success: true,
        violations,
        total,
      };
    } catch (error) {
      console.error("Error in getViolations service:", error);
      return { success: false, message: error.message };
    }
  }

  static async updateViolationStatus(
    violationId,
    status,
    paymentDetails = null
  ) {
    try {
      if (!violationId) {
        return { success: false, message: "Violation ID is required" };
      }

      if (!status) {
        return { success: false, message: "Status is required" };
      }

      // Validate status
      const validStatuses = [
        "pending",
        "paid",
        "appealed",
        "dismissed",
        "completed",
      ];
      if (!validStatuses.includes(status)) {
        return { success: false, message: "Invalid status value" };
      }

      // Update object
      const updateObj = {
        status,
        updatedAt: new Date(),
      };

      // If status is 'paid', update payment information
      if (status === "paid" && paymentDetails) {
        updateObj.payment = {
          amount: paymentDetails.amount,
          date: paymentDetails.date || new Date(),
          method: paymentDetails.method,
          receipt: paymentDetails.receipt,
        };
      }

      // Update the violation
      const updatedViolation = await Violation.findByIdAndUpdate(
        violationId,
        { $set: updateObj },
        { new: true }
      );

      if (!updatedViolation) {
        return { success: false, message: "Violation not found" };
      }

      return {
        success: true,
        message: `Violation status updated to ${status} successfully`,
        data: updatedViolation,
      };
    } catch (error) {
      console.error("Error in updateViolationStatus service:", error);
      return { success: false, message: error.message };
    }
  }

  static async getViolationsByTourist(passport, id = null) {
    try {
      const query = {};

      if (passport) {
        query["tourist.passport"] = passport;
      } else if (id) {
        query["tourist.id"] = id;
      } else {
        return { success: false, message: "Passport number or ID is required" };
      }

      const violations = await Violation.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        violations,
      };
    } catch (error) {
      console.error("Error in getViolationsByTourist service:", error);
      return { success: false, message: error.message };
    }
  }

  static async getViolationById(id) {
    try {
      if (!ObjectId.isValid(id)) {
        return { success: false, message: "Invalid violation ID" };
      }

      const violation = await Violation.findById(id).lean();

      if (!violation) {
        return { success: false, message: "Violation not found" };
      }

      return {
        success: true,
        violation,
      };
    } catch (error) {
      console.error("Error in getViolationById service:", error);
      return { success: false, message: error.message };
    }
  }
  static async getViolationsByOfficer(officerId) {
    try {
      if (!officerId) {
        return { success: false, message: "Officer ID is required" };
      }
  
      const violations = await Violation.find({ "officer.id": officerId })
        .sort({ createdAt: -1 })
        .lean();
  
      return {
        success: true,
        violations,
      };
    } catch (error) {
      console.error("Error in getViolationsByOfficer service:", error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = ViolationService;
