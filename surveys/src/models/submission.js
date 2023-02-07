const mongoose = require("mongoose");

const submissionSchema = mongoose.Schema({
  studentId: mongoose.Schema.ObjectId,
  survey: {
    type: mongoose.Schema.ObjectId,
    ref: "Survey",
  },
  answers: [Int], //should store the number of choice chosen from the answers of the questions
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: "survey" });

  next();
});
