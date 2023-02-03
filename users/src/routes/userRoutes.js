const express = require("express");
const authController = require("../controllers/authController");
const staffController = require("../controllers/staffController");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/verifyCode", authController.verifyCode);
router.patch("/resetPassword", authController.resetPassword);

//Student
const studentsRouter = router.route("/students");
studentsRouter
  .route("/students")
  .get(authController.protect, studentController.getAllStudents)
  .post(
    authController.protect,
    authController.restrictTo("system admin"),
    studentController.createStudent
  );

studentsRouter
  .get("/:id")
  .get(authController.protect, studentController.getStudent)
  .patch(
    authController.protect,
    authController.restrictTo("system admin"),
    studentController.updateStudent
  )
  .delete(
    authController.protect,
    authController.restrictTo("system admin"),
    studentController.deleteStudent
  );

studentsRouter
  .route("/updateMe")
  .patch(authController.protect, studentController.updateMe);

module.exports = router;
