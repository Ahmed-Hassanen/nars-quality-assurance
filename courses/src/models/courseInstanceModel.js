const mongoose = require("mongoose");

const courseInstanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "course",
  },
  courseSpecsPath: String,
  courseReportPath: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  approved: {
    type: Boolean,
    default: false,
  },
  reportCompleted: {
    type: Boolean,
    default: false,
  },
  materialsPaths: [
    {
      path: String,
      date: Date,
    },
  ],
  marks: [
    {
      studentId: mongoose.Schema.ObjectId,
      mark: Number,
    },
  ],
  exams: [mongoose.Schema.ObjectId],
  students: [mongoose.Schema.ObjectId],
  assignments: [mongoose.Schema.ObjectId],
  instructors: [mongoose.Schema.ObjectId],
  teachingAssistant: mongoose.Schema.ObjectId,
});

const CourseInstance = new mongoose.model(
  "courseInstance",
  courseInstanceSchema
);

module.exports = CourseInstance;
