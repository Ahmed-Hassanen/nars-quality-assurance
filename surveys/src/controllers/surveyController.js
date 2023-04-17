const Survey = require("../models/surveyModel");
const Sumbission = require("../models/submissionModel");
const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const axios = require("axios");

//Surveys
exports.getAllSurveys = factory.getAll(Survey);
exports.addSurvey = catchAsync(async (req, res, next) => {
  if (!req.body.courseInstance) {
    return next(new AppError("Survey must belong to course instance", 400));
  }
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  const header = `authorization: Bearer ${token}`;
  const courseInstance = await axios
    .get(`http://courses:8080/created-courses/${req.body.courseInstance}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  //console.log(courseInstance);
  if (courseInstance.status === "fail") {
    return next(new AppError(courseInstance.message, courseInstance.code));
  }
  req.body.questions = [];
  courseInstance.data.courseSpecs.courseLearningOutcomes.forEach((clo) => {
    clo.learningOutcomes.forEach((lo) =>
      req.body.questions.push(lo.description)
    );
  });
  console.log(req.body.questions);
  const doc = await Survey.create(req.body);
  res.status(201).json({
    status: "success",

    data: doc,
  });
});
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
  const survey = await Survey.findById(surveyId);

  //check if dueTo Date is passed or not
  const currentDate = Date.now();
  if (survey.dueTo && currentDate > survey.dueTo) {
    return next(
      new AppError("This survey is over, you can't add any submission", 400)
    );
  }

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
