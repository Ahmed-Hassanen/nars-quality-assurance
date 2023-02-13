const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const Course = require("../models/courseModel");
const CourseInstance = require("../models/courseInstanceModel");
const axios = require("axios");

exports.createCourse = factory.createOne(Course);
exports.updateCourse = factory.updateOne(Course);
exports.deleteCourse = factory.deleteOne(Course);
exports.getAllCourses = factory.getAll(Course);

exports.createCourseInstance = catchAsync(async (req, res, next) => {
  query = Course.findById(req.body.course);
  const orignalCourse = await query;
  if (!orignalCourse) {
    return next(new AppError("No document found with that id", 404));
  }
  const header = `authorization: Bearer ${req.cookies.jwt}`;
  const studentsData = await axios
    .get(
      `http://users:8080/students/?program=${orignalCourse.program}&academicYear=${orignalCourse.academicYear}`,
      {
        headers: header,
      }
    )
    .then((res) => res.data)
    .catch((e) => {
      return {
        status: false,
        message: "something went wrong",
        code: 500,
      };
    });
  if (studentsData.status === false) {
    return next(new AppError(studentsData.message, studentsData.code));
  }
  if (studentsData.results === 0) {
    return next(new AppError("no student at this program", 400));
  }
  const students = [];
  studentsData.data.forEach((student) => {
    if (
      !student.passedCourses.find(
        (passCourse) => passCourse == orignalCourse._id
      )
    ) {
      students.push(student._id);
    }
  });
  req.body.students = students;
  const courseinstance = await CourseInstance.create(req.body);
  const updatedStudents = [];
  studentsData.data.forEach((student) => {
    student.courses.push(courseinstance._id);
    console.log(student.courses);
    updatedStudents.push(
      axios.patch(
        `http://users:8080/students/${student._id}`,
        {
          courses: student.courses,
        },
        {
          headers: { authorization: `Bearer ${req.cookies.jwt}` },
        }
      )
    );
  });

  const promises = await Promise.all(updatedStudents);
  res.status(201).json({
    status: "success",
    data: courseinstance,
  });
});

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
