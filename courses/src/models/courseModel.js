const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Course must have a Name"],
  },
  code: {
    type: String,
    unique: true,
    trim: true,
  },
  academicYear: {
    type: String,
    required: [true, "course must belong to ademic year"],
  },
  program: mongoose.Schema.ObjectId,
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
  department: mongoose.Schema.ObjectId,
  faculty: mongoose.Schema.ObjectId,
  exams: [mongoose.Schema.ObjectId],
  fullMark: {
    type: Number,
    required: [true, "course must have a full mark"],
  },
  materialsPaths: [
    {
      path: String,
      name:String,
      description:String,
      date: Date,
    },
  ],
});

const Course = mongoose.model("course", courseSchema);

module.exports = Course;
