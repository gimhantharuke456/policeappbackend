const ViolationService = require("../Services/ViolationService");


exports.newViolation = async (req, res, next) => {
    console.log("createViolation function invoked");
  
    try {
      const { tourist, violation, officer, timestamp } = req.body.formData;
      console.log("Request Body:", req.body);
  
      const newViolation = await ViolationService.addViolation(
        tourist,
        violation,
        officer,
        timestamp
      );
  
      console.log("Service Response:", newViolation);
  
      if (newViolation.success) {
        console.log("Success: Violation record created successfully");
        return res
          .status(201)
          .json({ status: true, success: newViolation.message, data: newViolation.data });
      } else {
        console.log(
          "Error: Violation creation failed with message:",
          newViolation.message
        );
        return res
          .status(400)
          .json({ status: false, error: newViolation.message });
      }
    } catch (error) {
      console.error("Error in createViolation controller:", error);
      res.status(500).json({ status: false, error: "Internal Server Error" });
    }
  };
  
  exports.getViolations = async (req, res, next) => {
    try {
      const {
        _id,
        'tourist.name': touristName,
        'tourist.passport': touristPassport,
        'tourist.country': touristCountry,
        'violation.type': violationType,
        'violation.date': violationDate,
        'officer.id': officerId,
        status
      } = req.body;
  
      // Log the received request body
      console.log("Request Body:", req.body);
  
      const successRes = await ViolationService.getViolations(
        _id,
        touristName,
        touristPassport,
        touristCountry,
        violationType,
        violationDate,
        officerId,
        status
      );
      
      // Log the success response
      console.log("Success Response:", successRes);
  
      if (successRes.success) {
        res.status(200).json({
          status: true,
          violations: successRes.violations,
          total: successRes.total
        });
      } else {
        res.status(400).json({ status: false, error: successRes.message });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, error: "Internal Server Error" });
    }
  };

  exports.getViolationById = async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Fetching violation by ID:", id);
  
      const result = await ViolationService.getViolations(id);
      if (result.success && result.violations.length > 0) {
        return res.status(200).json({
          status: true,
          violation: result.violations[0], // Return the first (and only) match
        });
      } else {
        return res.status(404).json({
          status: false,
          error: "Violation not found",
        });
      }
    } catch (error) {
      console.error("Error in getViolationById:", error);
      res.status(500).json({ status: false, error: "Internal Server Error" });
    }
  };
  
  exports.updateViolationStatus = async (req, res, next) => {
    try {
      const { violationId, status, paymentDetails } = req.body;
      console.log("Update Violation Status Request:", req.body);
  
      const updateResult = await ViolationService.updateViolationStatus(
        violationId,
        status,
        paymentDetails
      );
  
      if (updateResult.success) {
        return res.status(200).json({
          status: true,
          message: updateResult.message,
          data: updateResult.data
        });
      } else {
        return res.status(400).json({
          status: false,
          error: updateResult.message
        });
      }
    } catch (error) {
      console.error("Error in updateViolationStatus controller:", error);
      res.status(500).json({ status: false, error: "Internal Server Error" });
    }
  };
  
  exports.getViolationsByTourist = async (req, res, next) => {
    try {
      const { passport, id } = req.params;
      console.log("Get Violations By Tourist Request:", { passport, id });
  
      const result = await ViolationService.getViolationsByTourist(passport, id);
  
      if (result.success) {
        return res.status(200).json({
          status: true,
          violations: result.violations
        });
      } else {
        return res.status(400).json({
          status: false,
          error: result.message
        });
      }
    } catch (error) {
      console.error("Error in getViolationsByTourist controller:", error);
      res.status(500).json({ status: false, error: "Internal Server Error" });
    }
  };

  exports.getViolationsByOfficer = async (req, res) => {
    try {
      const { officerId } = req.body;
      console.log("Fetching violations for officer:", officerId);
  
      const result = await ViolationService.getViolationsByOfficer(officerId);
      if (result.success) {
        return res.status(200).json({
          status: true,
          violations: result.violations,
        });
      } else {
        return res.status(400).json({
          status: false,
          error: result.message,
        });
      }
    } catch (error) {
      console.error("Error in getViolationsByOfficer:", error);
      res.status(500).json({ status: false, error: "Internal Server Error" });
    }
  };
  
  // Add to UserController.js (or create a new file)
  exports.updateProfile = async (req, res) => {
    try {
      const { officerSVC, fullName, policeStation } = req.body;
      console.log("Updating profile for officer:", officerSVC);
  
      const result = await UserService.updateProfile(officerSVC, fullName, policeStation);
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