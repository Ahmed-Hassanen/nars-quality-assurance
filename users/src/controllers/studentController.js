const Student = require("../models/studentModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");
const { exists } = require("../models/studentModel");
const axios = require("axios");

exports.getStudent = factory.getOne(Student);
exports.getAllStudents = factory.getAll(Student);
exports.updateStudent = factory.updateOne(Student);
exports.deleteStudent = factory.deleteOne(Student);
exports.createStudent = catchAsync(async (req, res, next) => {
  const header = `authorization: Bearer ${req.cookies.jwt}`;

  const faculty = await axios
    .get(`http://faculty:8080/getFacultySummary/${req.body.faculty}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => {
      return {
        status: false,
        message: "something went wrong",
        code: 500,
      };
    });
  if (faculty.status === false) {
    return next(new AppError(faculty.message, faculty.code));
  }
  req.body.academicYear = faculty.data.academicYears;
  const doc = await Student.create(req.body);
  res.status(201).json({
    status: "success",

    data: doc,
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email", "about");
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await Student.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

exports.addPassedCourses = catchAsync(async (req, res, next) => {
  let query = Student.findById(req.params.id);

  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  let exists = false;
  const exPassedCourses = doc.passedCourses.length;
  doc.passedCourses.forEach((course) => {
    if (course == req.body.passedCourse) exists = true;
  });
  console.log(req.body.passedCourse);
  if (!exists) {
    doc.passedCourses.push(req.body.passedCourse);
  }
  if (
    (doc.passedCourses.length = doc.courses.length - 2) &&
    doc.passedCourses.length != exPassedCourses
  )
    doc.academicYear.shift();
  doc.save();
  res.status(200).json({
    status: "success",

    data: doc,
  });
});
