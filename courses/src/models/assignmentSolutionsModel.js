const mongoose = require("mongoose");

const assignmentSolutionSchema = new mongoose.Schema({
  student: mongoose.Schema.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  Mark: Number,
  solutionPath:{
    type:String
  },
  Assignment:mongoose.Schema.ObjectId
});

const AssignmentSolution = mongoose.model("assignmentSolutions", assignmentSolutionSchema);

module.exports = AssignmentSolution;