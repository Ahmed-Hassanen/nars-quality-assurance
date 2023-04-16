const express = require("express");
const surveyController = require("../controllers/surveyController");
const { protect } = require("../shared/middlewares/protectMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, surveyController.getAllSurveys)
  .post(protect, surveyController.addSurvey);

router
  .route("/submissions/:id")
  .get(protect, surveyController.getSurveySubmissions);
router.route("/submissions").post(protect, surveyController.addSumbission);

router
  .route("/student-submissions")
  .get(protect, surveyController.getStudentSubmissions);

router
  .route("/:id")
  .get(protect, surveyController.getSurveyById)
  .delete(protect, surveyController.deleteSurvey);

router
  .route("/submissions/:id")
  .get(protect, surveyController.getSubmission)
  .delete(protect, surveyController.deleteSubmission);

module.exports = router;
