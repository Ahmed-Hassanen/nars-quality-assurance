const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "department must have a name"],
  },
  about: {
    type: String,
    required: [true, "department must have about"],
  },
  departmentHead: {
    type: String,
    required: [true, "department must have a department head"],
  },
  competences: {
    type: [String],
    required: [true, "faculty must have competences"],
  },
  faculty: {
    type: String,
    required: [true, "department must belong to faculty"],
  },
  programs: {
    type: [String],
  },

  vision: {
    type: String,
  },
  mission: {
    type: String,
  },
  objectives: {
    type: String,
    required: [true, "department must have objectives"],
  },
});

const department = mongoose.model("Department", departmentSchema);

module.exports = department;
