const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Course must have a Name"],
  },
  code: {
    type: String,
    unique: true,
    trim: true,
  },
  academicYear: {
    type: String,
    required: [true, "course must belong to ademic year"],
  },
  program: mongoose.Schema.ObjectId,
  competences: [mongoose.Schema.ObjectId],
  exams: [mongoose.Schema.ObjectId],
});

const Course = mongoose.model("course", courseSchema);

module.exports = Course;
