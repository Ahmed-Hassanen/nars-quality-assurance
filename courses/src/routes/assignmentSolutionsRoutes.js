const express = require("express");
const assignmentSolutionController = require("../controllers/assignmentSolutionsController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, assignmentSolutionController.getAllAssignmentSolutions)
  .post(
    protect,
    assignmentSolutionController.uploadAssignmentSolution,
    assignmentSolutionController.addAssignmentSolution
  );

router
  .route("/:id")
  .get(assignmentSolutionController.getAssignmentSolution)
  .delete(protect, assignmentSolutionController.deleteAssignmentSolution)
  .patch(protect, assignmentSolutionController.updateAssignmentSolution);

module.exports = router;
