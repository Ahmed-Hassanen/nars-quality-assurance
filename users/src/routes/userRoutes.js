const express = require("express");
const authController = require("../controllers/authController");
const staffController = require("../controllers/staffController");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/signup", authController.signupWithEmail);
router.post("/verifyCode", authController.verifyCode);
router.patch("/resetPassword", authController.resetPassword);
router.post("/signup", authController.signupWithEmail);
router.post("/completeSignup", authController.completeSignup);
router.post("/login", authController.login);
router.patch("/addPassedCourses/:id", studentController.addPassedCourses);
router
  .route("/students/")
  .get(authController.protect, studentController.getAllStudents)
  .post(
    authController.protect,
    authController.restrictTo("system admin"),
    studentController.createStudent
  );

router
  .route("/students/:id")
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

router
  .route("/students/updateMe")
  .patch(
    authController.protect,
    studentController.uploadUserPhoto,
    studentController.updateMe
  );

//Staff
router
  .route("/staff/updateMe")
  .patch(
    authController.protect,
    staffController.uploadUserPhoto,
    staffController.updateMe
  );
router
  .route("/staff")
  .get(authController.protect, staffController.getAllStaffMembers)
  .post(
    authController.protect,
    authController.restrictTo("system admin"),
    staffController.createStaff
  );

router.route("/addSystemAdmin").post(staffController.createStaff);

router
  .route("/staff/get-certain-staff")
  .get(authController.protect, staffController.getCertainStaffMembers);

router
  .route("/staff/update-staff-courses")
  .patch(authController.protect, staffController.updateStaffCourses);

router
  .route("/staff/:id")
  .get(authController.protect, staffController.getStaff)
  .patch(authController.protect, staffController.updateStaff)
  .delete(
    authController.protect,
    authController.restrictTo("system admin"),
    staffController.deleteStaff
  );

router.route("/is-protected").post(authController.protectRequest);
router.route("/is-restricted").post(authController.restrictRequest);

module.exports = router;
