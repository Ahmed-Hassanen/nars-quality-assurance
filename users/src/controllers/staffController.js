const Staff = require("../models/staffModel");
const factory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getAllStaffMembers = factory.getAll(Staff);
exports.deleteStaff = factory.deleteOne(Staff);
exports.updateStaff = factory.updateOne(Staff);
exports.getStaff = factory.getOne(Staff);
exports.createStaff = factory.createOne(Staff);

//finds all staff members to a certain role like get all instructors for example
exports.getCertainStaffMembers = catchAsync(async (req, res, next) => {
  const staff = await Staff.find({
    role: req.body.role,
  });

  res.status(200).json({
    status: "success",
    results: staff.length,
    data: staff,
  });
});

//TODO make the email as an index
exports.getStaffMemberByEmail = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  if (!email) {
    return next(new AppError("You should insert an email", 401));
  }
  let doc = await Staff.find({ email });

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
});
