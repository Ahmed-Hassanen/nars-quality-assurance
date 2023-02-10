const Department = require("../models/departmentModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");
const axios = require("axios");

exports.getAllDepartments = factory.getAll(Department);
exports.deleteDepartment = factory.deleteOne(Department);
exports.updateDepartment = factory.updateOne(Department);
exports.createDepartment = factory.createOne(Department);
exports.getDepartment = catchAsync(async (req, res, next) => {
  let query = Department.findById(req.params.id);
  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
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
  if (faculty.status === false) {
    return next(new AppError(faculty.message, faculty.code));
  }
  console.log(faculty.data);
  doc.faculty = faculty.data.name;
  // console.log(doc.faculty);
  res.status(200).json({
    status: "success",

    data: doc,
  });
});
