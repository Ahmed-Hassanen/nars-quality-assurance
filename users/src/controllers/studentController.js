const Student = require("../models/studentModel");
const jwt = require("jsonwebtoken");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");
const path = require("path");
const multer = require("multer");
const { exists } = require("../models/studentModel");
const axios = require("axios");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.getStudent = factory.getOne(Student);
exports.getAllStudents = factory.getAll(Student);
exports.updateStudent = factory.updateOne(Student);
exports.deleteStudent = factory.deleteOne(Student);
exports.getCourses = catchAsync(async (req, res, next) => {
  let query = Student.findById(req.params.id);
  const student = await query;
  const courses = student.courses;
  console.log("hereeeeeeeeeeeeeeeeeee", courses);
  const passedCourses = student.passedCourses;
  const generalcourses = [];
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  const header = `authorization: Bearer ${token}`;
  for (let i = 0; i < courses.length; i++) {
    let passed = false;

    const course = await axios
      .get(`http://courses:8080/created-courses/${courses[i]}`, {
        headers: header,
      })
      .then((res) => res.data)
      .catch((e) => e.response.data);

    if (course.status === false) {
      return next(new AppError(course.message, course.code));
    }
    for (let j = 0; j < passedCourses.length; j++) {
      if (course.data.course._id == passedCourses[j]) {
        passed = true;
        break;
      }
    }
    generalcourses.push({ course: course.data, passed });
  }
  res.status(201).json({
    status: "success",

    courses: generalcourses,
  });
});
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

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/photos/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

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
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  console.log(updatedUser);
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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
    doc.passedCourses.length >= doc.courses.length - 2 &&
    doc.passedCourses.length != exPassedCourses
  )
    doc.academicYear.shift();
  doc.save();
  res.status(200).json({
    status: "success",

    data: doc,
  });
});

exports.getStudentPhoto = catchAsync(async (req, res, next) => {
  let query = Student.findById(req.params.id);
  //if (popOptions) query = query.populate(popOptions);
  const student = await query;

  if (!student) {
    return next(new AppError("No document found with that id", 404));
  }
  res.download(path.resolve(`/${__dirname}/../public/photos/${student.photo}`));
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const student = await Student.findById(req.params.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (
    !(await student.correctPassword(req.body.passwordCurrent, student.password))
  ) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  student.password = req.body.password;
  student.passwordConfirm = req.body.passwordConfirm;
  await student.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(student, 200, req, res);
});
