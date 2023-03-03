const express = require("express");
const facultyController = require("../controllers/facultyController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");
const router = express.Router();
router.route("/getFacultySummary/:id").get(facultyController.getFacultySummary);
router
  .route("/")
  .get(protect, facultyController.getAllFaculties)
  .post(protect, facultyController.createFaculty);

// router
//   .route("/updateCompetences/:id")
//   .patch(
//     protect,
//     facultyController.updateCompetences,
//     facultyController.getFaculty
//   );
router
  .route("/:id")
  .get(protect, facultyController.getFaculty)
  .patch(protect, facultyController.updateFaculty)
  .delete(
    protect,

    facultyController.deletefaculty
  );

module.exports = router;
