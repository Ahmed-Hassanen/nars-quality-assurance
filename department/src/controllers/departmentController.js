const Department = require("../models/departmentModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");

exports.getAllDepartments = factory.getAll(Department);
exports.deleteDepartment = factory.deleteOne(Department);
exports.updateDepartment = factory.updateOne(Department);
exports.getDepartment = factory.getOne(Department);
exports.createDepartment = factory.createOne(Department);
