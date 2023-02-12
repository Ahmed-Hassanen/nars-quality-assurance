const express = require("express");
const programController = require("../controllers/programController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");
const router = express.Router();
router.post("/",protect,restrictTo("program admin"), programController.addProgram);

router.get("/",protect,restrictTo("program admin"), programController.getAllPrograms);

router.get("/:id",protect,restrictTo("program admin"), programController.getProgram);

router.patch("/:id",protect,restrictTo("program admin"), programController.UpdateProgram);

router.delete("/:id",protect,restrictTo("program admin"), programController.deleteProgram);

module.exports = router;

