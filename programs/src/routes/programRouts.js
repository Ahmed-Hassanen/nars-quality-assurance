const express = require("express");
const programController = require("../controllers/programController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");
const router = express.Router();
router.get("/getProgramSummary/:id", programController.getProgramSummary);
router.post("/",protect, programController.addProgram);

router.get("/",protect,programController.getAllPrograms);

router.get("/:id",protect, programController.getProgram);

router.patch("/:id",protect, programController.UpdateProgram);

router.delete("/:id",protect, programController.deleteProgram);

module.exports = router;

