const Assignment = require("../models/assignmentModel");
const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const multer = require("multer");
const Course = require("../models/courseModel");
const path = require("path");
const CourseInstance = require("../models/courseInstanceModel");
exports.getAllAssignments = factory.getAll(Assignment);
exports.deleteAssignment = factory.deleteOne(Assignment);
exports.getAssignment = catchAsync(async (req, res, next) => {
  let query = Assignment.findById(req.params.id).populate({ path: "course" });
  //if (popOptions) query = query.populate(popOptions);
  const assignment = await query;

  if (!assignment) {
    return next(new AppError("No document found with that id", 404));
  }
  console.log("hereeeeeeeeeeeeee");
  console.log(
    path.resolve(
      `/${__dirname}/../public/assignments${assignment.assignmentPath}`
    )
  );
  res.download(
    path.resolve(
      `/${__dirname}/../public/assignments/${assignment.assignmentPath}`
    )
  );
});
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/assignments/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: multerStorage,
});

exports.addAssignment = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("there is no file", 400));

  const course = await CourseInstance.findById(req.body.course);
  if (!course) {
    return next(new AppError("No document found with that id", 404));
  }
  req.body.assignmentPath = `${req.file.filename}`;
  const doc = await Assignment.create(req.body);
  res.status(201).json({
    status: "success",
    data: doc,
  });
});
exports.uploadAssignment = upload.single("assignmentPath");
