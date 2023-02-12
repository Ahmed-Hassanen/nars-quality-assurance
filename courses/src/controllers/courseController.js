const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const Course = require("../models/courseModel");
const CourseInstance = require("../models/courseInstanceModel");

exports.createCourse = factory.createOne(Course);
exports.updateCourse = factory.updateOne(Course);
exports.deleteCourse = factory.deleteOne(Course);
exports.getAllCourses = factory.getAll(Course);

exports.createCourseInstance = factory.createOne(CourseInstance);
exports.updateCourseInstance = factory.updateOne(CourseInstance);
exports.getCourseInstance = factory.getOne(CourseInstance);
exports.getAllCourseInstances = factory.getAll(CourseInstance);

exports.assignCourseConstructor = catchAsync(async (req, res, next) => {
  const instructorId = req.body.instructorId;

  const course = await CourseInstance.findById(req.params.id);

  const foundInstructor = course.instructors.findIndex(
    (e) => e == instructorId
  );
  console.log("Has found it ? " + foundInstructor);
  if (foundInstructor > -1) {
    return next(
      new AppError("This instructor is already assigned to this course!")
    );
  }

  const doc = await CourseInstance.findByIdAndUpdate(
    req.params.id,
    {
      $push: { instructors: req.body.instructorId },
    },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );

  res.status(201).json({
    status: "success",
    data: doc,
  });
});
