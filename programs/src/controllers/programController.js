const { promisify } = require("util");
const Program = require("../models/programModel");
const catchAsync = require("../shared/utils/catchAsync");
const AppError = require("../shared/utils/appError");
const factory = require("../shared/controllers/handlerFactory");
const axios = require("axios");
const path = require("path");

const multer = require("multer");

exports.addProgram = factory.createOne(Program);
exports.deleteProgram = factory.deleteOne(Program);
exports.UpdateProgram = factory.updateOne(Program);
exports.getProgram = factory.getOne(Program);
exports.getAllPrograms = factory.getAll(Program);
exports.getProgramSummary = factory.getOne(Program);
exports.getProgram = catchAsync(async (req, res, next) => {
  let query = Program.findById(req.params.id);
  const doc = await query;
  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  const header = `authorization: Bearer ${req.cookies.jwt}`;

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
  doc.department = department.data.name;
  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.viewComp = catchAsync(async (req, res, next) => {
  let query = Program.findById(req.params.id);
  const doc = await query;
  const header = `authorization: Bearer ${req.cookies.jwt}`;
  // const faculty = await axios
  //   .get(`http://faculty:8080/getFacultySummary/${doc.faculty}`, {
  //     headers: header,
  //   })
  //   .then((res) => res.data)
  //   .catch((e) => {
  //     return {
  //       status: false,
  //       message: "something went wrong",
  //       code: 500,
  //     };
  //   });

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
  const faculty = await axios
    .get(`http://faculty:8080/getFacultySummary/${department.data.faculty}`, {
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
    programComp: doc.competences,
    facultyComp: faculty.data.competences,
    departmentComp: department.data.competences,
  });
});

const multerProgramSpcs = require("multer");
const program = require("../models/programModel");
const multerStorageProgramSpcs = multerProgramSpcs.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/programSpcs/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerProgramReport = require("multer");
const multerStorageProgramReport = multerProgramReport.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/programsReport/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadProgramSpcs = multerProgramSpcs({
  storage: multerStorageProgramSpcs,
});
exports.uploadProgramSpcs = uploadProgramSpcs.single("programSpcs");

exports.addProgramSpcs = catchAsync(async (req, res, next) => {
  console.log(__dirname);
  if (!req.file) return next(new AppError("there is no file", 400));

  const program = await Program.findByIdAndUpdate(
    req.body.program,
    { programSpcs: `${req.file.filename}` },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );
  if (!program) {
    return next(new AppError("No program found with that id", 404));
  }
  res.status(201).json({
    status: "success",

    data: program,
  });
});

exports.getProgramSpcs = catchAsync(async (req, res, next) => {
  let query = Program.findById(req.params.id);
  //if (popOptions) query = query.populate(popOptions);
  const program = await query;

  if (!program) {
    return next(new AppError("No program found with that id", 404));
  }
  if (!program.programSpcs) {
    return next(new AppError("there is no spcs for this program", 404));
  }
  console.log("hereeeeeeeeeeeeee");
  console.log(
    path.resolve(`/${__dirname}/../public/programSpcs/${program.programSpcs}`)
  );
  res.download(
    path.resolve(`/${__dirname}/../public/programSpcs/${program.programSpcs}`)
  );
});

const uploadProgramReport = multerProgramSpcs({
  storage: multerStorageProgramReport,
});
exports.uploadProgramReport = uploadProgramReport.single("programReport");

exports.addProgramReport = catchAsync(async (req, res, next) => {
  console.log(__dirname);
  if (!req.file) return next(new AppError("there is no file", 400));

  const program = await Program.findByIdAndUpdate(
    req.body.program,
    { programReportPdf: `${req.file.filename}` },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );
  if (!program) {
    return next(new AppError("No program found with that id", 404));
  }
  res.status(201).json({
    status: "success",

    data: program,
  });
});

exports.getProgramReport = catchAsync(async (req, res, next) => {
  let query = Program.findById(req.params.id);
  //if (popOptions) query = query.populate(popOptions);
  const program = await query;

  if (!program) {
    return next(new AppError("No program found with that id", 404));
  }
  if (!program.programSpcs) {
    return next(new AppError("there is no report for this program", 404));
  }
  console.log("hereeeeeeeeeeeeee");
  console.log(
    path.resolve(
      `/${__dirname}/../public/programsReport/${program.programReportPdf}`
    )
  );
  res.download(
    path.resolve(
      `/${__dirname}/../public/programsReport/${program.programReportPdf}`
    )
  );
});

exports.getProgramLOs = catchAsync(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  const header = `authorization: Bearer ${token}`;
  const originalCourses = await axios
    .get(`http://courses:8080/original-courses?${req.params.id}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  //console.log(courseInstance);
  if (originalCourses.status === "fail") {
    return next(new AppError(courseInstance.message, courseInstance.code));
  }
  const programLOs = [];
  originalCourses.data.forEach((originalCourse) => {
    if (
      originalCourse.currentInstance &&
      originalCourse.currentInstance.courseSpecsCompleted
    ) {
      originalCourse.currentInstance.courseSpecs.courseLearningOutcomes.forEach(
        (courseLearningOutcome) => {
          courseLearningOutcome.learningOutcomes.forEach((lo) => {
            programLOs.push(lo.description);
          });
        }
      );
    }
  });
  res.status(200).json({
    status: "success",
    data: {
      programLOs,
    },
  });
});

exports.getProgramDirectAssessment = catchAsync(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  const header = `authorization: Bearer ${token}`;
  const originalCourses = await axios
    .get(`http://courses:8080/original-courses?${req.params.id}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  //console.log(courseInstance);
  if (originalCourses.status === "fail") {
    return next(new AppError(originalCourses.message, originalCourses.code));
  }

  ////////////////////////////////////////////////////////
  const competences = await axios
    .get(`http://programs:8080/viewComp/${req.params.id}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  //console.log(courseInstance);
  if (competences.status === "fail") {
    return next(new AppError(competences.message, competences.code));
  }
  ///////////////////////////////////////////////

  const courseAvgDirect = [];
  originalCourses.data.forEach((originalCourse) => {
    if (
      originalCourse.currentInstance &&
      originalCourse.currentInstance.report.avgCompetences.length > 0
    ) {
      const courseObj = {
        name: originalCourse.name,
        code: originalCourse.code,
      };
      let courseAvgComp = 0;
      originalCourse.currentInstance.report.avgCompetences.forEach(
        (competence) => {
          courseAvgComp += competence.avg;
        }
      );
      courseAvgComp =
        courseAvgComp /
        originalCourse.currentInstance.report.avgCompetences.length;
      courseObj.avg = courseAvgComp;
      courseAvgDirect.push(courseObj);
    }
  });
  // console.log("yooooooooooooooooooooooooooooo", competences);
  //////////////////////////////////////////////////
  const programComp = [];
  competences.programComp.forEach((comp) => programComp.push(comp.code));
  competences.facultyComp.forEach((comp) => programComp.push(comp.code));
  competences.departmentComp.forEach((comp) => programComp.push(comp.code));
  // console.log("hereeeeeeeeeeeeeeeeeee", programComp);
  const programCompAvgs = [];
  programComp.forEach((comp) => {
    let compAvg = 0;
    let numCourse = 0;
    // console.log("yooooooooooooooooooooooo", comp);
    originalCourses.data.forEach((originalCourse) => {
      // console.log(
      //   "yoooooooooooooooooooooooxxxx",
      //   originalCourse.currentInstance.report.avgCompetences.length
      // );
      if (
        originalCourse.currentInstance &&
        originalCourse.currentInstance.report.avgCompetences.length > 0
      ) {
        // console.log("yoooooooooooooooooooooooxxxxxx", originalCourse);
        originalCourse.currentInstance.report.avgCompetences.forEach(
          (courseComp) => {
            console.log("yooooooooooooooooooooooooooooooxxxx", courseComp.code);
            console.log("yooooooooooooooooooooooooooooooxxxx", comp);
            if (courseComp.code === comp) {
              compAvg += courseComp.avg;
              numCourse++;
            }
          }
        );
      }
    });
    compAvg = compAvg / numCourse;
    programCompAvgs.push({ code: comp, avg: compAvg });
  });
  /////////////////////
  const updatedProgram = await Program.findByIdAndUpdate(
    req.params.id,
    {
      "report.courseAvgDirect": courseAvgDirect,
      "report.programCompAvgs": programCompAvgs,
    },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );

  if (!updatedProgram) {
    return next(new AppError("No document found with that id", 404));
  }

  ////////////////////////
  res.status(200).json({
    status: "success",
    data: {
      report: updatedProgram.report,
    },
  });
});
exports.getProgramInDirectAssessment = catchAsync(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  const header = `authorization: Bearer ${token}`;
  const originalCourses = await axios
    .get(`http://courses:8080/original-courses?${req.params.id}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  //console.log(courseInstance);
  if (originalCourses.status === "fail") {
    return next(new AppError(originalCourses.message, originalCourses.code));
  }
  ////////////////////////////////////////////////////////
  const competences = await axios
    .get(`http://programs:8080/viewComp/${req.params.id}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  //console.log(courseInstance);
  if (competences.status === "fail") {
    return next(new AppError(competences.message, competences.code));
  }
  ///////////////////////////////////////////////

  const courseAvgInDirect = [];
  originalCourses.data.forEach((originalCourse) => {
    if (
      originalCourse.currentInstance &&
      originalCourse.currentInstance.report.avgCompetencesInDirect.length > 0
    ) {
      const courseObj = {
        name: originalCourse.name,
        code: originalCourse.code,
      };
      let courseAvgComp = 0;
      originalCourse.currentInstance.report.avgCompetencesInDirect.forEach(
        (competence) => {
          courseAvgComp += competence.avg;
        }
      );
      courseAvgComp =
        courseAvgComp /
        originalCourse.currentInstance.report.avgCompetencesInDirect.length;
      courseObj.avg = courseAvgComp;
      courseAvgInDirect.push(courseObj);
    }
  });
  //////////////////////////////////////////////////
  const programComp = [];
  competences.programComp.forEach((comp) => programComp.push(comp.code));
  competences.facultyComp.forEach((comp) => programComp.push(comp.code));
  competences.departmentComp.forEach((comp) => programComp.push(comp.code));
  console.log(programComp);
  const programCompAvgs = [];
  programComp.forEach((comp) => {
    let compAvg = 0;
    let numCourse = 0;
    originalCourses.data.forEach((originalCourse) => {
      if (
        originalCourse.currentInstance &&
        originalCourse.currentInstance.report.avgCompetencesInDirect.length > 0
      ) {
        originalCourse.currentInstance.report.avgCompetencesInDirect.forEach(
          (courseComp) => {
            if (courseComp.code === comp) {
              compAvg += courseComp.avg;
              numCourse++;
            }
          }
        );
      }
    });
    compAvg = compAvg / numCourse;
    programCompAvgs.push({ code: comp, avg: compAvg });
  });
  /////////////////////
  const updatedProgram = await Program.findByIdAndUpdate(
    req.params.id,
    {
      "report.courseAvgIndirect": courseAvgInDirect,
      "report.programCompAvgsIndirect": programCompAvgs,
    },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );

  if (!updatedProgram) {
    return next(new AppError("No document found with that id", 404));
  }

  ////////////////////////
  res.status(200).json({
    status: "success",
    data: {
      report: updatedProgram.report,
    },
  });
});

exports.getPercentageOfSpecsAndReports = catchAsync(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  const header = `authorization: Bearer ${token}`;
  const originalCourses = await axios
    .get(`http://courses:8080/original-courses?${req.params.id}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  //console.log(courseInstance);
  if (originalCourses.status === "fail") {
    return next(new AppError(originalCourses.message, originalCourses.code));
  }
  ////////////////////////////////////////////////////////
  const competences = await axios
    .get(`http://programs:8080/viewComp/${req.params.id}`, {
      headers: header,
    })
    .then((res) => res.data)
    .catch((e) => e.response.data);
  //console.log(courseInstance);
  if (competences.status === "fail") {
    return next(new AppError(competences.message, competences.code));
  }
  ///////////////////////////////////////////////

  let completedReports = 0;
  let completedSpecs = 0;
  originalCourses.data.forEach((originalCourse) => {
    if (
      originalCourse.currentInstance &&
      originalCourse.currentInstance.reportCompleted
    ) {
      completedReports++;
    }
    if (
      originalCourse.currentInstance &&
      originalCourse.currentInstance.courseSpecsCompleted
    ) {
      completedSpecs++;
    }
  });
  //////////////////////////////////////////////////
  console.log(originalCourses.data.length);
  const percentageOfFillingReport =
    completedReports / originalCourses.data.length;
  const percentageOfFillingSpecs = completedSpecs / originalCourses.data.length;
  /////////////////////
  const updatedProgram = await Program.findByIdAndUpdate(
    req.params.id,
    {
      "report.percentageOfFillingReport": percentageOfFillingReport,
      "report.percentageOfFillingSpecs": percentageOfFillingSpecs,
    },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );

  if (!updatedProgram) {
    return next(new AppError("No document found with that id", 404));
  }

  ////////////////////////
  res.status(200).json({
    status: "success",
    data: {
      percentageOfFillingReport:
        updatedProgram.report.percentageOfFillingReport,
      percentageOfFillingSpecs: updatedProgram.report.percentageOfFillingSpecs,
    },
  });
});
