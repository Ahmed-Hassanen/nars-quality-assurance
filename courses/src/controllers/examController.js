const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const Exam = require("../models/examModel");
const axios = require("axios");
const Course = require("../models/courseModel");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/exams/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: multerStorage,
});

exports.addExam = catchAsync(async (req, res, next) => {
  console.log(__dirname);
  if (!req.file) return next(new AppError("there is no file", 400));

  const course = await Course.findById(req.body.course);
  if (!course) {
    return next(new AppError("No document found with that id", 404));
  }
  req.body.title = `${req.body.description}-Exam-${req.body.date}-${course.name}`;
  req.body.path = `${req.file.filename}`;

  const doc = await Exam.create(req.body);
  res.status(201).json({
    status: "success",

    data: doc,
  });
});

exports.updateExam = factory.updateOne(Exam);
exports.deleteExam = factory.deleteOne(Exam);
exports.getAllExams = factory.getAll(Exam);
exports.getExam = catchAsync(async (req, res, next) => {
  let query = Exam.findById(req.params.id).populate({ path: "course" });
  //if (popOptions) query = query.populate(popOptions);
  const exam = await query;

  if (!exam) {
    return next(new AppError("No document found with that id", 404));
  }
  console.log("hereeeeeeeeeeeeee");
  console.log(path.resolve(`/${__dirname}/../public/exams${exam.path}`));
  res.download(path.resolve(`/${__dirname}/../public/exams/${exam.path}`));
  // res.send();
  // res.status(200).json({
  //   status: "success",

  //   data: exam,
  // });
});
exports.uploadExam = upload.single("exam");
