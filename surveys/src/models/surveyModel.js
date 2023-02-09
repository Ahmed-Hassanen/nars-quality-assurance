const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Survey must have a name"],
  },
  description: String,
  questions: {
    type: [
      {
        question: {
          type: String,
          required: [true, "Question must have a question"],
        },
        possibleAnswers: {
          type: [String],
          require: [true, "Question must have answers"],
        },
      },
    ],
    required: [true, "Survey must have questions"],
  },
  courseId: mongoose.Schema.ObjectId,
  programId: mongoose.Schema.ObjectId,
});

const Survey = new mongoose.model("Survey", surveySchema);

module.exports = Survey;
