const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const path = require("path");
const CourseInstance = require("../models/courseInstanceModel");
const Course = require("../models/courseModel");
exports.addDirectAssesment = catchAsync(async (req, res, next) => {
  let query = CourseInstance.findById(req.params.id);
  //if (popOptions) query = query.populate(popOptions);
  const courseInstance = await query;

  if (!courseInstance) {
    return next(new AppError("No courseInstance found with that id", 404));
  }
  query = Course.findById(courseInstance.course);
  //if (popOptions) query = query.populate(popOptions);
  const course = await query;

  if (!course) {
    return next(new AppError("No orignal course found with that id", 404));
  }
  if (!req.body.questions) {
    return next(new AppError("you should enter questions", 400));
  }
  const avgCompetences = [];
  let avg;
  course.competences.forEach((competency) => {
    avg = 0;
    let totalFullMark = 0;
    req.body.questions.forEach((question) => {
      if (question.competences.includes(competency.code)) {
        avg +=
          question.grades.reduce((a, b) => a + b, 0) / question.grades.length;
        console.log(
          avg,
          question.grades.reduce((a, b) => a + b, 0),
          question.grades.length
        );
        totalFullMark += question.fullMark;
      }
    });
    console.log(avg, totalFullMark);
    avg = (avg / totalFullMark) * 100;
    // competences[competency].avg = avg;
    avgCompetences.push({ code: competency.code, avg: avg });
  });
  const report = {
    questions: req.body.questions,
    avgCompetences,
  };
  console.log(report);
  const doc = await CourseInstance.findByIdAndUpdate(
    req.params.id,
    {
      "report.questions": report.questions,
      "report.avgCompetences": report.avgCompetences,
    },

    {
      new: true, //return updated document
      runValidators: true,
    }
  );
  res.status(201).json({
    status: "success",
    data: doc.report,
  });
});
