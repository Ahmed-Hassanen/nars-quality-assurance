const AssignmentSolution = require("../models/assignmentSolutionsModel");
const Assignment = require("../models/assignmentModel");
const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const multer = require("multer");
const Course = require("../models/courseModel");
const path = require("path");
const CourseInstance = require("../models/courseInstanceModel");
exports.getAllAssignmentSolutions = factory.getAll(AssignmentSolution);
exports.updateAssignmentSolution = factory.updateOne(AssignmentSolution);
exports.deleteAssignmentSolution = catchAsync(async (req, res, next) => {
  const doc = await AssignmentSolution.findById(req.params.id);
  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  const T = Date.now();
  if (T > doc.dueTO) {
    return next(
      new AppError("Too late! you can not delete it. the time ended", 400)
    );
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.getAssignmentSolution = catchAsync(async (req, res, next) => {
  let query = AssignmentSolution.findById(req.params.id).populate({
    path: "Assignment",
  });
  //if (popOptions) query = query.populate(popOptions);
  const assignmentSolution = await query;

  if (!assignmentSolution) {
    return next(new AppError("No document found with that id", 404));
  }
  const assignment = await Assignment.findById(assignmentSolution.Assignment);
  if (!assignment) {
    return next(new AppError("No document found with that id", 404));
  }
  const T = Date.now();
  if (T > assignment.dueTO) {
    return next(
      new AppError("Too late! you can not delete it. the time ended", 400)
    );
  }
  // console.log(path.resolve(`/${__dirname}/../public/assignmentSolutions/${assignmentSolution.solutionPath}`));
  res.download(
    path.resolve(
      `/${__dirname}/../public/assignmentSolutions/${assignmentSolution.solutionPath}`
    )
  );
});
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/assignmentSolutions/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: multerStorage,
});

exports.addAssignmentSolution = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("there is no file", 400));

  const course = await CourseInstance.findById(req.body.course);
  if (!course) {
    return next(new AppError("No document found with that id", 404));
  }
  const assignment = await Assignment.findById(req.body.Assignment);
  if (!assignment) {
    return next(new AppError("No document found with that id", 404));
  }
  const T = Date.now();
  if (T > assignment.dueTO) {
    return next(
      new AppError("Too late! you can not delete it. the time ended", 400)
    );
  }
  req.body.solutionPath = `${req.file.filename}`;
  const doc = await AssignmentSolution.create(req.body);
  res.status(201).json({
    status: "success",
    data: doc,
  });
});
exports.uploadAssignmentSolution = upload.single("solutionPath");
