const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  path: {
    type: String,
    required: [true, "exam must have a path"],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "course",
  },
  date: {
    type: Date,
    required: [true, "exam must have a date"],
  },
  instructors: mongoose.Schema.ObjectId,
  description: {
    type: String,
    enum: ["final", "mid term", "quiz"],
    required: [true, "exam must have a description"],
  },
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
