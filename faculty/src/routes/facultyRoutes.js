const express = require("express");
const facultyController = require("../controllers/facultyController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");
const router = express.Router();

router
  .route("/")
  .get(protect, restrictTo("faculty admin"), facultyController.getAllFaculties)
  .post(protect, restrictTo("faculty admin"), facultyController.createFaculty);
router
  .route("/getFacultySummary/:id")
  .get(
    protect,
    restrictTo("faculty admin", "department admin"),
    facultyController.getFacultySummary
  );

router
  .route("/updateCompetences/:id")
  .patch(
    protect,
    restrictTo("faculty admin"),
    facultyController.updateCompetences,
    facultyController.getFaculty
  );
router
  .route("/:id")
  .get(protect, restrictTo("faculty admin"), facultyController.getFaculty)
  .patch(protect, restrictTo("faculty admin"), facultyController.updateFaculty)
  .delete(
    protect,
    restrictTo("faculty admin"),
    facultyController.deletefaculty
  );

module.exports = router;
