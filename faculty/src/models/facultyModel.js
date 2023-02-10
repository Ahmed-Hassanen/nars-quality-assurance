const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "faculty must have a name"],
  },
  dean: {
    type: String,
    required: [true, "faculty must have a dean"],
  },
  about: {
    type: String,
    required: [true, "faculty must have about"],
  },
  competences: {
    type: [String],
    required: [true, "faculty must have competences"],
  },
  academicYears: {
    type: [String],
    required: [true, "department must have academic years"],
  },
  departments: [String],
});

const faculty = mongoose.model("Faculty", facultySchema);

module.exports = faculty;
