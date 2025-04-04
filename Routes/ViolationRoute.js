const route = require("express").Router();
const violationController = require("../Controllers/ViolationController");

route.post("/violation", violationController.newViolation);
route.post("/getviolation", violationController.getViolations);
route.get("/violation/:id", violationController.getViolationById);
route.post("/officer", violationController.getViolationsByOfficer);


module.exports = route;
