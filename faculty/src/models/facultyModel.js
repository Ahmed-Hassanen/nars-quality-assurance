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
  competences:{
    type:[
        {
    code:{
     type:String,
    required: [true, "program must have a code"],
         },
    description:{
    type:String,
    required: [true, "program must have a description"],
               }
    }
       ],
    required: [true, "Competences must have a description"],
},
  academicYears: {
    type: [String],
    required: [true, "department must have academic years"],
  },
  departments: [String],
});

const faculty = mongoose.model("Faculty", facultySchema);

module.exports = faculty;
