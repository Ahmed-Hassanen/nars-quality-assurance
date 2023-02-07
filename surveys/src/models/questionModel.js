const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question must have a question"],
  },
  possibleAnswers: {
    type: [String],
    require: [true, "Question must have answers"],
  },
});

const Question = new mongoose.model(questionSchema, "Question");

module.exports = Question;
