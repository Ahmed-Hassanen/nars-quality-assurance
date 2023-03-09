const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Course must have a Name"],
  },
  course: mongoose.Schema.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  deuTO:{
    type: Date
  },
  possibleMarks: Number,
  assignmentPath:{
    type:String
  },
  instructor: mongoose.Schema.ObjectId
});

const Assignment = mongoose.model("assignment", assignmentSchema);

module.exports = Assignment;