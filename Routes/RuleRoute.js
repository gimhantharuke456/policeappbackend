const route = require("express").Router();
const ruleController = require("../Controllers/RuleController");

route.post("/alltracks", ruleController.alltracks);

module.exports = route;
