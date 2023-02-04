const Student = require("../models/studentModel");
const factory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getStudent = factory.getOne(Student);
exports.getAllStudents = factory.getAll(Student);
exports.updateStudent = factory.updateOne(Student);
exports.deleteStudent = factory.deleteOne(Student);
exports.createStudent = factory.createOne(Student);

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

//TODO make the code as an index
exports.getStudentByCode = catchAsync(async (req, res, next) => {
  const code = req.body.code;
  if (!code) {
    return next(new AppError("You should insert a code", 401));
  }
  let doc = await Student.find({ code });

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
});
