const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/signup", authController.signupWithEmail);
router.post("/verifyCode", authController.verifyCode);
router.patch("/resetPassword", authController.resetPassword);

module.exports = router;
