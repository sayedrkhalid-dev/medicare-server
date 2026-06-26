const express = require("express");

const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");

const userController = require("./user.controller");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
*/

router.get("/me", authenticate, userController.getMe);

router.patch("/me", authenticate, userController.updateProfile);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.get("/", authenticate, authorize("admin"), userController.getAllUsers);

router.get(
  "/:userId",
  authenticate,
  authorize("admin"),
  userController.getUserById,
);

router.patch(
  "/:userId/suspend",
  authenticate,
  authorize("admin"),
  userController.suspendUser,
);

router.patch(
  "/:userId/activate",
  authenticate,
  authorize("admin"),
  userController.activateUser,
);

module.exports = router;
