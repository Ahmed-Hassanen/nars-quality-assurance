const express = require("express");
const assignmentController = require("../controllers/assignmentController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");

const router = express.Router();

router.route("/")
.get(assignmentController.getAllAssignments)
.post(assignmentController.uploadAssignment,assignmentController.addAssignment)

router
.route("/:id")
.get(assignmentController.getAssignment)
.delete(protect,assignmentController.deleteAssignment)

module.exports = router;