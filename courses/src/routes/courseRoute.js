const express = require("express");
const courseController = require("../controllers/courseController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");

const router = express.Router();
router.route("/viewComp/:id").get(protect, courseController.viewComp);
router
  .route("/original-courses")
  .get(protect, courseController.getAllCourses)
  .post(protect, restrictTo("system admin"), courseController.createCourse);
router.route("/checkComp/:id").post(protect, courseController.checkComp);
router
  .route("/created-courses")
  .get(protect, courseController.getAllCourseInstances)
  .post(
    protect,
    restrictTo("system admin", "instructor"),
    courseController.createCourseInstance
  );
router
  .route("/original-courses/getAllMaterials/:id")
  .get(courseController.getAllMaterials);
router
  .route("/original-courses/uploadMaterials")
  .patch(
    protect,
    courseController.uploadMaterials,
    courseController.addMaterials
  );
router
  .route("/original-courses/getMaterials/:id/:id2")
  .get(courseController.getMaterial);
router
  .route("/original-courses/deleteMaterials/:id/:id2")
  .get(courseController.deleteMaterial);
router
  .route("/original-courses/:id")
  .get(protect, restrictTo("system admin"), courseController.getCourse)
  .patch(protect, restrictTo("system admin"), courseController.updateCourse)
  .delete(protect, restrictTo("system admin"), courseController.deleteCourse);

router
  .route("/created-courses/:id")
  .get(protect, courseController.getCourseInstance)
  .patch(protect, courseController.updateCourseInstance);

router
  .route("/assign-course-instructor")
  .patch(
    protect,
    restrictTo("system admin"),
    courseController.assignCourseInstructor
  );

module.exports = router;
