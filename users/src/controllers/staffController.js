const Staff = require("../models/staffModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");

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

exports.updateStaffCourses = catchAsync(async (req, res, next) => {
  const course = req.body.courseId;

  const updatedStaff = await Staff.findByIdAndUpdate(
    req.params.id,
    {
      $push: { courses: course },
    },
    {
      new: true, //return updated document
      runValidators: true,
    }
  );

  if (!updatedStaff) {
    res.json({
      status: false,
      message: "Staff member is not found",
      code: 403,
    });
  } else {
    res.json({
      status: true,
      message: "Staff member is updated",
      code: 201,
    });
  }
});
