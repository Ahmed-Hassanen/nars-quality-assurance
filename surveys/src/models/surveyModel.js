const mongoose = require("mongoose");
const Question = require("./questionModel");
const validator = require("validator");

const surveySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Survey must have a name"],
  },
  description: String,
  questions: {
    type: [Question],
    required: [true, "Survey must have questions"],
  },
  courseId: mongoose.Schema.ObjectId,
  programId: mongoose.Schema.ObjectId,
});

const Survey = new mongoose.model("Survey", surveySchema);

module.exports = Survey;
