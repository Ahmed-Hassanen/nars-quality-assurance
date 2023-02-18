const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const Course = require("../models/courseModel");
const CourseInstance = require("../models/courseInstanceModel");
const axios = require("axios");

exports.getAllMarks = catchAsync(async (req, res, next) => {
  let query = CourseInstance.findById(req.params.course);

  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }

  res.status(200).json({
    status: "success",

    data: doc.marks,
  });
});

exports.addAllStudentMarks = catchAsync(async (req, res, next) => {
  const doc = await CourseInstance.findByIdAndUpdate(
    req.params.course,
    req.body,
    {
      new: true, //return updated document
      runValidators: true,
    }
  );

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  isPassedCourse(req, res, next);

  res.status(200).json({
    status: "success",

    data: doc,
  });
});

exports.addStudentMarks = catchAsync(async (req, res, next) => {
  let query = CourseInstance.findById(req.params.course);
  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  //console.log(doc.marks);
  const marks = doc.marks;
  for (let i = 0; i < marks.length; i++) {
    if (marks[i].studentId === req.params.studentId)
      return next(new AppError("the student has a mark already", 400));
  }
  //   const marks = [{ studentId: "gdrgrd", mark: 57 }];
  marks.push({ studentId: req.params.studentId, mark: req.body.mark });
  console.log(marks);
  const newCourseInstance = await CourseInstance.findByIdAndUpdate(
    req.params.course,
    {
      marks: marks,
    },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );

  if (!newCourseInstance) {
    return next(new AppError("No document found with that id", 404));
  }
  isPassedCourse(req, res, next);
  res.status(200).json({
    status: "success",

    data: newCourseInstance,
  });
});

exports.getStudentMarks = catchAsync(async (req, res, next) => {
  let query = CourseInstance.findById(req.params.course);

  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  let studentMark;
  doc.marks.forEach((mark) => {
    if (mark.studentId == req.params.studentId) studentMark = mark.mark;
  });
  if (!studentMark)
    return next(new AppError("the student has no mark yet", 404));

  res.status(200).json({
    status: "success",

    data: studentMark,
  });
});

exports.updateStudentMarks = catchAsync(async (req, res, next) => {
  let query = CourseInstance.findById(req.params.course);

  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  let studentMark;
  let marks = doc.marks;
  let i = 0;
  marks.forEach((mark) => {
    if (mark.studentId == req.params.studentId) marks[i].mark = req.body.mark;
    i++;
  });
  const newCourseInstance = await CourseInstance.findByIdAndUpdate(
    req.params.course,
    {
      marks: marks,
    },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );
  isPassedCourse(req, res, next);
  res.status(200).json({
    status: "success",

    data: marks,
  });
});

isPassedCourse = catchAsync(async (req, res, next) => {
  let query = CourseInstance.findById(req.params.course);
  const courseinstance = await query;

  if (!courseinstance) {
    return next(new AppError("No document found with that id", 404));
  }

  let course = await Course.findById(courseinstance.course);

  if (!course) {
    return next(new AppError("No document found with that id", 404));
  }
  const updatedStudents = [];
  courseinstance.marks.forEach((student) => {
    console.log(student.studentId);
    if (
      student.mark >= course.fullMark / 2 &&
      student.mark <= course.fullMark
    ) {
      updatedStudents.push(
        axios.patch(
          `http://users:8080/addPassedCourses/${student.studentId}`,
          {
            passedCourse: courseinstance.course,
          },
          {
            headers: { authorization: `Bearer ${req.cookies.jwt}` },
          }
        )
      );
    }
  });

  const promises = Promise.all(updatedStudents)
    .then(console.log("done"))
    .catch((err) => {
      console.log(err);
    });
  // if (!promises) {
  //   return next(new AppError("something went wrong ", 500));
  // }
  next();
});
