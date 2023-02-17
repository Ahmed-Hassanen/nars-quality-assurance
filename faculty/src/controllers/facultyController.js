const Faculty = require("../models/facultyModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");
const axios = require("axios");
const faculty = require("../models/facultyModel");

exports.getAllFaculties = factory.getAll(Faculty);
exports.deletefaculty = factory.deleteOne(Faculty);
exports.updateFaculty = factory.updateOne(Faculty);
exports.createFaculty = catchAsync(async (req, res, next) => {
  // if (!req.body.competences) {
  //   return next(new AppError("faculty must have competences", 400));
  // }
  // const competences_ids = await axios
  //   .post(`http://competences:8080/`, {
  //     competences: req.body.competences,
  //     code: "a",
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
  const doc = await Faculty.create(req.body);
  res.status(201).json({
    status: "success",

    data: doc,
  });
});
exports.getFacultySummary = factory.getOne(Faculty);
exports.getFaculty = catchAsync(async (req, res, next) => {
  const header = `authorization: Bearer ${req.cookies.jwt}`;
  const departments = await axios
    .get(`http://department:8080/?faculty=${req.params.id}`, {
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
  if (departments.status === false) {
    return next(new AppError(departments.message, departments.code));
  }

  const departmentsNames = [];

  departments.data.forEach((department) => {
    departmentsNames.push(department.name);
  });
  // console.log(departmentsNames);
  let query = Faculty.findById(req.params.id);
  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  doc.departments = departmentsNames;

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
  // console.log(doc.competences);
  //console.log(doc.departments);
  res.status(200).json({
    status: "success",

    data: doc,
  });
});

// exports.updateCompetences = catchAsync(async (req, res, next) => {
//   let query = Faculty.findById(req.params.id);
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
