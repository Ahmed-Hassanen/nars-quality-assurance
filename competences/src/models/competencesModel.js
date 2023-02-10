const mongoose = require("mongoose");
const validator = require("validator");

const competencesSchema = new mongoose.Schema({

code:{
    type:String,
    required: [true, "Competences must have a code"],
},
description:{
    type: String,
    required: [true, "Competences must have a description"],
}

})

const competences = mongoose.model("competences", competencesSchema);

module.exports = competences;