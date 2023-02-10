const express = require("express");
const competencesController = require("../controllers/competencesController");

const router = express.Router();
router.get('/',competencesController.getAll)
router.post('/',competencesController.addCompetences)
router.patch('/:id',competencesController.updateCompetences)
router.delete('/:id',competencesController.deleteOne)

module.exports =router;