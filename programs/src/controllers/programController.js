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
const multerStorageProgramSpcs = multerProgramSpcs.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/programSpcs/`);
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
