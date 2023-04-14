const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Survey must have a name"],
  },
  description: String,
  questions: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  dueTo: {
    type: Date,
    required: [true, "Survey must have a due-to date"],
  },
  courseInstance: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Survey must belong to course instance"],
  },
  programId: mongoose.Schema.ObjectId,
});

const Survey = new mongoose.model("Survey", surveySchema);

module.exports = Survey;
