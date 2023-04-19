const catchAsync = require("../shared/utils/catchAsync");
const factory = require("./../shared/controllers/handlerFactory");
const AppError = require("./../shared/utils/appError");
const Course = require("../models/courseModel");
const CourseInstance = require("../models/courseInstanceModel");
const axios = require("axios");
const { Kafka } = require("kafkajs");
const path = require("path");
const kafka = new Kafka({
  clientId: "my-app",
  brokers: process.env.KAFKA_ZOOKEEPER_CONNECT,
});

const producer = kafka.producer();

const multer = require("multer");
exports.createCourse = factory.createOne(Course);
exports.updateCourse = factory.updateOne(Course);
exports.deleteCourse = factory.deleteOne(Course);
exports.getCourse = factory.getOne(Course);
exports.getAllCourses = factory.getAll(Course);

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/materials/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: multerStorage });

exports.addMaterials = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("there is no file updated", 400));
  }
  const course = await Course.findById(req.body.course);

  if (!course) {
    return next(new AppError("No document found with that id", 404));
  }
  course.materialsPaths.push({
    path: req.file.filename,
    name: req.body.name,
    description: req.body.description,
    date: Date.now(),
  });
  const doc = await Course.findByIdAndUpdate(req.body.course, course, {
    new: true, //return updated document
    runValidators: true,
  });
  console.log(course.materialsPaths.length, "hhhhhhhhhhhhhhhhhhhhhh");
  res.status(201).json({
    status: "success",
    data: doc,
  });
});
exports.uploadMaterials = upload.single("materialsPaths");
exports.createCourseInstance = catchAsync(async (req, res, next) => {
  query = Course.findById(req.body.course);
  const orignalCourse = await query;
  if (!orignalCourse) {
    return next(new AppError("No document found with that id", 404));
  }

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log("Program is " + orignalCourse.program);
  console.log("Year is " + orignalCourse.academicYear);
  let url;
  if (orignalCourse.program) {
    console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    url = `http://users:8080/students/?program=${orignalCourse.program}&academicYear.0=${orignalCourse.academicYear}`;
  } else if (orignalCourse.department)
    url = `http://users:8080/students/?department=${orignalCourse.department}&academicYear.0=${orignalCourse.academicYear}`;
  else
    url = `http://users:8080/students/?faculty=${orignalCourse.faculty}&academicYear.0=${orignalCourse.academicYear}`;
  const studentsData = await axios
    .get(url, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
    .catch((e) => {
      return {
        status: false,
        message: "something went wrong",
        code: 500,
      };
    });
  console.log(studentsData.data);
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

  //Update Course Specs if created before
  let courseSpecs;
  const course = await CourseInstance.findOne({
    course: req.body.course,
    instructor: req.body.instructor,
  });
  if (course && course.courseSpecs) {
    courseSpecs = course.courseSpecs;
  }

  const courseinstance = await CourseInstance.create(req.body);
  courseinstance.courseSpecs = courseSpecs;
  await courseinstance.save();
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
          headers: { authorization: `Bearer ${token}` },
        }
      )
    );
  });
  const newOriginalCourse = await Course.findByIdAndUpdate(
    req.body.course,
    { currentInstance: courseinstance._id },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );

  const promises = await Promise.all(updatedStudents);

  res.status(201).json({
    status: "success",
    data: courseinstance,
  });
});

exports.updateCourseInstance = catchAsync(async (req, res, next) => {
  if (!req.body.courseSpecs) {
    const doc = await CourseInstance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, //return updated document
        runValidators: true,
      }
    );

    if (!doc) {
      return next(new AppError("No document found with that id", 404));
    }

    res.status(200).json({
      status: "success",

      data: doc,
    });
    return next();
  }

  const course = await CourseInstance.findById(req.params.id);
  const courseData = req.body.courseSpecs.courseData;
  const courseAims = req.body.courseSpecs.courseAims;
  const courseContent = req.body.courseSpecs.courseContent;
  const studentAcademicCounselingSupport =
    req.body.courseSpecs.studentAcademicCounselingSupport;
  const courseLearningOutcomes = req.body.courseSpecs.courseLearningOutcomes;
  const lecturePlan = req.body.courseSpecs.lecturePlan;
  const studentAssessment = req.body.courseSpecs.studentAssessment;
  const facilities = req.body.courseSpecs.facilities;
  const references = req.body.courseSpecs.references;
  if (courseData) {
    course.courseSpecs.courseData = courseData;
  }
  if (courseAims) {
    course.courseSpecs.courseAims = courseAims;
  }
  if (courseContent) {
    course.courseSpecs.courseContent = courseContent;
  }
  if (studentAcademicCounselingSupport) {
    course.courseSpecs.studentAcademicCounselingSupport =
      studentAcademicCounselingSupport;
  }
  if (courseLearningOutcomes) {
    course.courseSpecs.courseLearningOutcomes = courseLearningOutcomes;
  }
  if (lecturePlan) {
    course.courseSpecs.lecturePlan = lecturePlan;
  }
  if (studentAssessment) {
    course.courseSpecs.studentAssessment = studentAssessment;
  }
  if (references) {
    course.courseSpecs.references = references;
  }
  //facilities is the last page so receiving it means the course specs is completed
  if (facilities) {
    course.courseSpecs.facilities = facilities;
    course.courseSpecsCompleted = true;
  }

  const updatedCourse = await course.save();

  if (!updatedCourse) {
    return next(new AppError("No document found with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedCourse,
  });
});

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
exports.viewComp = catchAsync(async (req, res, next) => {
  let query = Course.findById(req.params.id);
  const doc = await query;
  const header = `authorization: Bearer ${req.cookies.jwt}`;
  const faculty = await axios
    .get(`http://faculty:8080/getFacultySummary/${doc.faculty}`, {
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

  const department = await axios
    .get(`http://department:8080/getDepartmentSummary/${doc.department}`, {
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
  const program = await axios
    .get(`http://programs:8080/getProgramSummary/${doc.program}`, {
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
  res.status(201).json({
    status: "success",
    programComp: program.data.competences,
    facultyComp: faculty.data.competences,
    departmentComp: department.data.competences,
  });
});
exports.checkComp = catchAsync(async (req, res, next) => {
  let query1 = CourseInstance.findById(req.params.id);
  const doc1 = await query1;

  let query2 = Course.findById(doc1.course).select("-id");
  const doc2 = await query2;
  console.log(doc2);
  const comp = req.body.competences;
  const temp = [];
  for (let i = 0; i < doc2.competences.length; i++) {
    temp[i] = {
      code: doc2.competences[i].code,
      description: doc2.competences[i].description,
    };
  }
  let ok;
  for (let i = 0; i < comp.length; i++) {
    ok = 0;
    for (let j = 0; j < temp.length; j++) {
      if (comp[i].code == temp[j].code) {
        ok = 1;
        break;
      }
    }
    if (ok == 0) {
      return next(new AppError("not match the competences", 404));
    }
  }
  doc1.approved = true;
  res.status(201).json({
    status: "success",
  });
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
exports.getMaterial = catchAsync(async (req, res, next) => {
  let query = Course.findById(req.params.id);
  //if (popOptions) query = query.populate(popOptions);
  const course = await query;
  if (!course) {
    return next(new AppError("No document found with that id", 404));
  }
  let ok = 0;
  let materialPath;
  for (let i = 0; i < course.materialsPaths.length; i++) {
    if (course.materialsPaths[i]._id == req.params.id2) {
      ok = 1;
      materialPath = course.materialsPaths[i].path;
      break;
    }
  }
  if (!ok) {
    return next(new AppError("No document found with that id", 404));
  }
  // console.log(path.resolve(`/${__dirname}/../public/assignments${assignment.assignmentPath}`));
  res.download(
    path.resolve(`/${__dirname}/../public/materials/${materialPath}`)
  );
  // res.status(200).json({
  //   status: "success",
  // });
});

exports.deleteMaterial = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  let query = Course.findById(req.params.id);
  //if (popOptions) query = query.populate(popOptions);
  const course = await query;
  if (!course) {
    return next(new AppError("No document found with that id", 404));
  }
  let ok = 0;
  let index;
  for (let i = 0; i < course.materialsPaths.length; i++) {
    if (course.materialsPaths[i]._id == req.params.id2) {
      ok = 1;
      index = i;
      break;
    }
  }
  if (!ok) {
    return next(new AppError("No document found with that id", 404));
  }
  course.materialsPaths.splice(index, 1);
  console.log(course.materialsPaths);
  const doc = await Course.findByIdAndUpdate(req.params.id, course, {
    new: true, //return updated document
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
  });
});

exports.getAllMaterials = catchAsync(async (req, res, next) => {
  let query = Course.findById(req.params.id);
  const course = await query;
  if (!course) {
    return next(new AppError("No document found with that id", 404));
  }
  const Materials = course.materialsPaths;
  res.status(200).json({
    status: "success",
    results: Materials.length,
    data: Materials,
  });
});
const multerSpcsPdf = require("multer");
const multerStorageSpcsPdf = multerSpcsPdf.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/courseSpcs/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadSpcsPdf = multerSpcsPdf({ storage: multerStorageSpcsPdf });
exports.uploadSpcsPdf = uploadSpcsPdf.single("courseSpcs");

exports.addSpcsPdf = catchAsync(async (req, res, next) => {
  console.log(__dirname);
  if (!req.file) return next(new AppError("there is no file", 400));

  const courseinstance = await CourseInstance.findByIdAndUpdate(
    req.body.courseInstance,
    { courseSpecsPath: `${req.file.filename}` },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );
  if (!courseinstance) {
    return next(new AppError("No courseinstance found with that id", 404));
  }
  res.status(201).json({
    status: "success",

    data: courseinstance,
  });
});

exports.getSpecsPdf = catchAsync(async (req, res, next) => {
  let query = CourseInstance.findById(req.params.id);
  //if (popOptions) query = query.populate(popOptions);
  const courseinstance = await query;

  if (!courseinstance) {
    return next(new AppError("No courseinstance found with that id", 404));
  }
  console.log("hereeeeeeeeeeeeee");
  console.log(
    path.resolve(
      `/${__dirname}/../public/courseSpcs/${courseinstance.courseSpecsPath}`
    )
  );
  res.download(
    path.resolve(
      `/${__dirname}/../public/courseSpcs/${courseinstance.courseSpecsPath}`
    )
  );
  // res.send();
  // res.status(200).json({
  //   status: "success",

  //   data: exam,
  // });
});
