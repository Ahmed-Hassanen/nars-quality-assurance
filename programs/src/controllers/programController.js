const { promisify } = require("util");
const Program = require("../models/programModel");
const catchAsync = require("../shared/utils/catchAsync");
const AppError = require("../shared/utils/appError");
const factory = require("../shared/controllers/handlerFactory");

exports.addProgram = factory.createOne(Program);
exports.deleteProgram=factory.deleteOne(Program);
exports.UpdateProgram=factory.updateOne(Program);
exports.getProgram=factory.getOne(Program);
exports.getAllPrograms=factory.getAll(Program);

