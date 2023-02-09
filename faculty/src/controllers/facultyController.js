const Faculty = require("../models/facultyModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");

exports.getAllFaculties = factory.getAll(Faculty);
exports.deletefaculty = factory.deleteOne(Faculty);
exports.updateFaculty = factory.updateOne(Faculty);
exports.getFaculty = factory.getOne(Faculty);
exports.createFaculty = factory.createOne(Faculty);
