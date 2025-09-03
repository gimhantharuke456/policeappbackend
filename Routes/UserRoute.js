const route = require("express").Router();
const userController = require("../Controllers/UserController");

route.post("/registration", userController.register);
route.post("/login", userController.login);
route.post("/verify", userController.verify);
route.post("/profile", userController.updateProfile);
route.get("/profile/:id", userController.getProfileDetails);
route.get("/users", userController.getAllUsers);
route.get("/svc/:svcNumber", userController.getUserBySVC);

module.exports = route;
