const { promisify } = require("util");
const Program = require("../models/programModel");
const catchAsync = require("../shared/utils/catchAsync");
const AppError = require("../shared/utils/appError");
const factory = require("../shared/controllers/handlerFactory");
const axios = require("axios");
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
