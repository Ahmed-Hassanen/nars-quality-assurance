const Survey = require("../models/surveyModel");
const Sumbission = require("../models/submissionModel");
const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");

//Surveys
exports.getAllSurveys = factory.getAll(Survey);
exports.addSurvey = factory.createOne(Survey);
exports.deleteSurvey = factory.deleteOne(Survey);
exports.getSurveyById = factory.getOne(Survey);

//Submissions
exports.deleteSubmission = factory.deleteOne(Sumbission);
exports.getSubmission = factory.getOne(Sumbission);

exports.addSumbission = catchAsync(async (req, res, next) => {
  const surveyId = req.body.surveyId;
  const studentId = req.body.studentId;
  const answers = req.body.answers;

  const surveySubmissions = await Sumbission.find({
    survey: surveyId,
    studentId: studentId,
  });

  //check if the submission is already there
  if (surveySubmissions.length == 0) {
    const doc = await Sumbission.create({
      survey: surveyId,
      studentId,
      answers,
    });
    res.status(201).json({
      status: "success",
      data: doc,
    });
  } else {
    return next(
      new AppError("You've already added your submission to this survey", 400)
    );
  }
});

exports.getSurveySubmissions = catchAsync(async (req, res, next) => {
  const surveyId = req.body.surveyId;

  const submissions = await Sumbission.find({
    survey: surveyId,
  });

  res.status(200).json({
    length: submissions.length,
    status: "success",
    data: submissions,
  });
});

exports.getStudentSubmissions = catchAsync(async (req, res, next) => {
  const studentId = req.body.studentId;
  const submissions = await Sumbission.find({ studentId });

  res.status(200).json({
    status: "success",
    data: submissions,
  });
});
