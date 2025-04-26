const route = require("express").Router();
const userController = require("../Controllers/UserController");

route.post("/registration", userController.register);
route.post("/login", userController.login);
route.post("/verify", userController.verify);
route.post("/profile", userController.updateProfile);
route.get("/profile/:id", userController.getProfileDetails);

module.exports = route;
