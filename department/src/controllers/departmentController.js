const Department = require("../models/departmentModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");
const axios = require("axios");

exports.getAllDepartments = factory.getAll(Department);
exports.deleteDepartment = factory.deleteOne(Department);
exports.getDepartmentSummary = factory.getOne(Department);
exports.updateDepartment = factory.updateOne(Department);
exports.createDepartment = catchAsync(async (req, res, next) => {
  // if (!req.body.competences) {
  //   return next(new AppError("faculty must have competences", 400));
  // }
  // const competences_ids = await axios
  //   .post(`http://competences:8080/`, {
  //     competences: req.body.competences,
  //     code: "b",
  //   })
  //   .then((res) => res.data)
  //   .catch((e) => {
  //     return {
  //       status: false,
  //       message: "something went wrong",
  //       code: 500,
  //     };
  //   });
  // if (competences_ids.status === false) {
  //   return next(new AppError(competences_ids.message, competences_ids.code));
  // }
  // req.body.competences = competences_ids.ids;
  const doc = await Department.create(req.body);
  res.status(201).json({
    status: "success",

    data: doc,
  });
});
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
  // if (faculty.status === false) {
  //   return next(new AppError(faculty.message, faculty.code));
  // }
  // const competences_description = await axios
  //   .post(`http://competences:8080/all/`, { ids: doc.competences })
  //   .then((res) => res.data)
  //   .catch((e) => {
  //     return {
  //       status: false,
  //       message: "something went wrong",
  //       code: 500,
  //     };
  //   });
  // if (competences_description.status === false) {
  //   return next(
  //     new AppError(
  //       competences_description.message,
  //       competences_description.code
  //     )
  //   );
  // }
  // doc.competences = [];
  // competences_description.data.forEach((competence) => {
  //   const obj = {};
  //   obj.code = competence.code;
  //   obj.description = competence.description;
  //   doc.competences.push(obj);
  // });
  //console.log(faculty.data);
  doc.faculty = faculty.data.name;
  // console.log(doc.faculty);
  res.status(200).json({
    status: "success",

    data: doc,
  });
});

// exports.updateCompetences = catchAsync(async (req, res, next) => {
//   let query = Department.findById(req.params.id);
//   const doc = await query;

//   if (!doc) {
//     return next(new AppError("No document found with that id", 404));
//   }
//   if (!req.body.code) {
//     return next(new AppError("should specify code", 400));
//   }
//   if (!req.body.description) {
//     return next(new AppError("should specify description", 400));
//   }
//   competence_id = doc.competences[parseInt(req.body.code[1]) - 1];
//   //console.log(competence_id);
//   const competences_description = await axios
//     .patch(`http://competences:8080/${competence_id}`, {
//       description: req.body.description,
//     })
//     .then((res) => res.data)
//     .catch((e) => {
//       return {
//         status: false,
//         message: "something went wrong",
//         code: 500,
//       };
//     });
//   if (competences_description.status === false) {
//     return next(
//       new AppError(
//         competences_description.message,
//         competences_description.code
//       )
//     );
//   }
//   next();
// });
