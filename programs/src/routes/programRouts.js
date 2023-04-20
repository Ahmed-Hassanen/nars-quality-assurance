const express = require("express");
const programController = require("../controllers/programController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");
const router = express.Router();

router
  .route("/programSpcs")
  .post(programController.uploadProgramSpcs, programController.addProgramSpcs);
router.route("/programSpcs/:id").get(programController.getProgramSpcs);

router.get("/getProgramSummary/:id", programController.getProgramSummary);
router.route("/viewComp/:id").get(protect, programController.viewComp);
router
  .route("/")
  .post(protect, programController.addProgram)
  .get(protect, programController.getAllPrograms);

router
  .route("/:id")
  .get(protect, programController.getProgram)
  .patch(protect, programController.UpdateProgram)
  .delete(protect, programController.deleteProgram);

router
  .route("/:id/directAssessment")
  .get(programController.getProgramDirectAssessment);

router.route("/:id/LOS").get(programController.getProgramLOs);

module.exports = router;
