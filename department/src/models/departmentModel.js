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
  faculty: {
    type: String,
    required: [true, "department must belong to faculty"],
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
