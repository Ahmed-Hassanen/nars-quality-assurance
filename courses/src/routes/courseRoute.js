const express = require("express");
const courseController = require("../controllers/courseController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");

const router = express.Router();

router
  .route("/original-courses")
  .get(protect, courseController.getAllCourses)
  .post(protect, restrictTo("system admin"), courseController.createCourse);

router
  .route("/created-courses")
  .get(protect, courseController.getAllCourseInstances)
  .post(
    protect,
    restrictTo("system admin", "instructor"),
    courseController.createCourseInstance
  );

router
  .route("/original-courses/:id")
  .patch(protect, restrictTo("system admin"), courseController.updateCourse)
  .delete(protect, restrictTo("system admin"), courseController.deleteCourse);

router
  .route("/created-courses/:id")
  .get(protect, courseController.getCourseInstance)
  .patch(protect, courseController.updateCourseInstance);

router
  .route("/assign-course-instructor/:id")
  .patch(courseController.assignCourseConstructor);

module.exports = router;
