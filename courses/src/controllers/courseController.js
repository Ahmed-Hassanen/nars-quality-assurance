const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const Course = require("../models/courseModel");
const CourseInstance = require("../models/courseInstanceModel");
const axios = require("axios");
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: process.env.KAFKA_ZOOKEEPER_CONNECT,
});

const producer = kafka.producer();

const multer = require("multer");
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
  console.log("Program is " + orignalCourse.program);
  console.log("Year is " + orignalCourse.academicYear);
  let url;
  if (orignalCourse.program)
    url = `http://users:8080/students/?program=${orignalCourse.program}&academicYear=${orignalCourse.academicYear}`;
  else if (orignalCourse.department)
    url = `http://users:8080/students/?department=${orignalCourse.department}&academicYear=${orignalCourse.academicYear}`;
  else
    url = `http://users:8080/students/?faculty=${orignalCourse.faculty}&academicYear=${orignalCourse.academicYear}`;
  const studentsData = await axios
    .get(url, {
      headers: header,
    })
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

exports.assignCourseInstructor = catchAsync(async (req, res, next) => {
  const instructorId = req.body.instructorId;
  const courseId = req.body.courseId;

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  const staffData = await axios
    .patch(
      `http://users:8080/staff/update-staff-courses`,
      {
        courseId,
        instructorId,
      },
      {
        headers: { authorization: `Bearer ${token}` },
      }
    )
    .then((res) => res.data)
    .catch((e) => {
      console.log("EXCPETIOB IS " + e);
      return {
        status: false,
        message: "something went wrong",
        code: 500,
      };
    });

  if (staffData.status) {
    res.status(201).json({
      status: "success",
      staff: staffData.staff,
    });
  } else {
    res.status(staffData.code).json({
      status: false,
      message: staffData.message,
    });
  }
});

exports.sendAssignCourseEvent = catchAsync(async (req, res, next) => {
  const data = {
    courseId: req.body.courseId,
    instructorId: req.body.instructorId,
  };
  await producer.connect();
  await producer.send({
    topic: process.env.KAFKA_ASSIGN_COURSE_TOPIC,
    messages: [{ value: JSON.stringify(data) }],
  });
});
