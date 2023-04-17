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
  const sums = new Array(answers.length).fill(0);
  const avgLOSIndir = [];
  const avgCompsIndir = [];
  let token;
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
  const allSurveySubmissions = await Sumbission.find({
    survey: surveyId,
  });
  for (let i = 0; i < allSurveySubmissions.length; i++) {
    for (let j = 0; j < allSurveySubmissions[i].answers.length; j++) {
      sums[j] += allSurveySubmissions[i].answers[j];
    }
  }
  for (let i = 0; i < answers.length; i++) sums[i] += answers[i];
  for (let i = 0; i < answers.length; i++) {
    avgLOSIndir.push({
      LO: "LO" + (i + 1),
      avg: sums[i] / (allSurveySubmissions.length + 1),
    });
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
    .get(`http://courses:8080/created-courses/${survey.courseInstance}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  if (courseInstance.status === "fail") {
    return next(new AppError(courseInstance.message, courseInstance.code));
  }
  const courseLearningOutcomes =
    courseInstance.data.courseSpecs.courseLearningOutcomes;
  const competences = courseInstance.data.course.competences;
  for (let i = 0; i < competences.length; i++) {
    let sum = 0;
    let count = 0;
    let avg = 0;
    for (let j = 0; j < courseLearningOutcomes.length; j++) {
      for (
        let k = 0;
        k < courseLearningOutcomes[j].learningOutcomes.length;
        k++
      ) {
        for (
          let m = 0;
          m <
          courseLearningOutcomes[j].learningOutcomes[k].mappedCompetence.length;
          m++
        ) {
          if (
            competences[i].code ==
            courseLearningOutcomes[j].learningOutcomes[k].mappedCompetence[m]
          ) {
            for (let h = 0; h < avgLOSIndir.length; h++) {
              if (
                courseLearningOutcomes[j].learningOutcomes[k].code ==
                avgLOSIndir[h].LO
              ) {
                sum += avgLOSIndir[h].avg;
                count++;
                break;
              }
            }
            break;
          }
        }
      }
    }
    avg = sum / count;
    avgCompsIndir.push({ code: competences[i].code, avg });
  }
  //check if the submission is already there
  if (surveySubmissions.length == 0) {
    const doc = await Sumbission.create({
      survey: surveyId,
      studentId,
      answers,
    });
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    axios.patch(
      `http://courses:8080/created-courses/${survey.courseInstance}`,
      {
        report: {
          avgLOSInDirect: avgLOSIndir,
          avgCompetencesInDirect: avgCompsIndir,
        },
      },
      {
        headers: { authorization: `Bearer ${token}` },
      }
    );
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
  const surveyId = req.params.id;

  const submissions = await Sumbission.find({
    survey: req.params.id,
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
