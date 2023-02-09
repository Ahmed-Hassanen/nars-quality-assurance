const mongoose = require("mongoose");

const submissionSchema = mongoose.Schema({
  studentId: mongoose.Schema.ObjectId,
  survey: {
    type: mongoose.Schema.ObjectId,
    ref: "Survey",
  },
  answers: [Number], //should store the number of choice chosen from the answers of the questions
});

submissionSchema.pre(/^findOne/, function (next) {
  this.populate({ path: "survey", select: "-__v -questions" });

  next();
});

submissionSchema.pre(/^find/, function (next) {
  this.populate({ path: "survey" });

  next();
});

const Submission = new mongoose.model("Submission", submissionSchema);

module.exports = Submission;
