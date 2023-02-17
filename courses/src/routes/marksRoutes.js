const express = require("express");
const marksController = require("../controllers/marksController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");
const router = express.Router({ mergeParams: true });
//router.route("/addPassedCourses").get(marksController.isPassedCourse);
router
  .route("/")
  .get(marksController.getAllMarks)
  .post(marksController.addAllStudentMarks);

router
  .route("/:studentId")
  .get(marksController.getStudentMarks)
  .post(marksController.addStudentMarks)
  .patch(marksController.updateStudentMarks);

module.exports = router;
