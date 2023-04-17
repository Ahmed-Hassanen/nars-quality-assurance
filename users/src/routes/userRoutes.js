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
router.get("/userToken", authController.userToken);
router.post("/addStudentsToProgram", staffController.addStudentsToProgram);
router.post(
  "/addStudentsToDepartment",
  staffController.addStudentsToDepartment
);
router
  .route("/students/")
  .get(authController.protect, studentController.getAllStudents)
  .post(
    authController.protect,
    authController.restrictTo("system admin"),
    studentController.createStudent
  );
router
  .route("/students/getCourses/:id")
  .get(authController.protect, studentController.getCourses);
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
  .route("/students/updateMe/:id")
  .patch(
    authController.protect,
    studentController.uploadUserPhoto,
    studentController.updateMe
  );
router
  .route("/students/getPhoto/:id")
  .get(authController.protect, studentController.getStudentPhoto);
router
  .route("/students/updatePassword/:id")
  .patch(authController.protect, studentController.updatePassword);

//Staff
router
  .route("/staff/updateMe/:id")
  .patch(
    authController.protect,
    staffController.uploadUserPhoto,
    staffController.updateMe
  );
router
  .route("/staff/updatePassword/:id")
  .patch(authController.protect, staffController.updatePassword);
router
  .route("/staff/getPhoto/:id")
  .get(authController.protect, staffController.getStaffPhoto);
router
  .route("/staff")
  .get(authController.protect, staffController.getAllStaffMembers)
  .post(authController.protect, staffController.createStaff);

router.route("/addSystemAdmin").post(staffController.createStaff);

router
  .route("/staff/get-certain-staff")
  .get(authController.protect, staffController.getCertainStaffMembers);

router
  .route("/staff/update-staff-courses")
  .patch(authController.protect, staffController.updateStaffCourses);

router
  .route("/staff/role/:id")
  .patch(authController.protect, staffController.addStaffRole)
  .delete(authController.protect, staffController.deleteStaffRole);

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
