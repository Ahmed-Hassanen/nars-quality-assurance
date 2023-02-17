const express = require("express");
const examController = require("../controllers/examController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");

const router = express.Router();

router
  .route("/")
  .get(examController.getAllExams)
  .post(examController.uploadExam, examController.addExam);
router
  .route("/:id")
  .get(examController.getExam)
  .patch(protect, examController.updateExam)
  .delete(protect, examController.deleteExam);

module.exports = router;
