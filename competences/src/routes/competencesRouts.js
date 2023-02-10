const express = require("express");
const competencesController = require("../controllers/competencesController");

const router = express.Router();
router.post("/all", competencesController.getAll);
router.post("/", competencesController.addCompetences);
router.patch("/:id", competencesController.updateCompetences);
router.delete("/:id", competencesController.deleteOne);

module.exports = router;
