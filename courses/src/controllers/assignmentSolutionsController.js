const AssignmentSolution = require("../models/assignmentSolutionsModel");
const Assignment = require("../models/assignmentModel");
const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const multer = require("multer");
const Course = require("../models/courseModel");

exports.getAllAssignmentSolutions = factory.getAll(AssignmentSolution);
exports.deleteAssignmentSolution =   catchAsync(async (req, res, next) => {
    const doc = await AssignmentSolution.findById(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that id", 404));
    }
    const T = Date.now();
    if(T>doc.dueTO){
        return next(new AppError("Too late! you can not delete it. the time ended", 400));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
exports.getAssignmentsSolutionById = factory.getOne(AssignmentSolution);
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
  
    const course = await Course.findById(req.body.course);
    if (!course) {
      return next(new AppError("No document found with that id", 404));
    }
const assignment= await Assignment.findById(req.body.Assignment)
if (!assignment) {
    return next(new AppError("No document found with that id", 404));
  }
    const T = Date.now();
    if(T>assignment.dueTO){
        return next(new AppError("Too late! you can not delete it. the time ended", 400));
    }
    req.body.solutionPath = `${req.file.filename}`;
    const doc = await AssignmentSolution.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });
exports.uploadAssignmentSolution = upload.single("solutionPath");