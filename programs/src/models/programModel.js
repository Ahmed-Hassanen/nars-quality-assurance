const mongoose = require("mongoose");
const validator = require("validator");

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "program must have a name"],
  },
  competences: {
    type: [
      {
        code: {
          type: String,
          required: [true, "program must have a code"],
        },
        description: {
          type: String,
          required: [true, "program must have a description"],
        },
      },
    ],
    required: [true, "Competences must have a description"],
  },

  department: {
    type: String,
    required: [true, "program must have a department"],
  },
  programSpcs: {
    type: String,
  },
  report: {
    courseAvgDirect: {
      type: [Object],
    },
    programCompAvgs: {
      type: [Object],
    },
  },
});

const program = mongoose.model("program", programSchema);

module.exports = program;
