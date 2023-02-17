const Staff = require("../models/staffModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");
const multer = require('multer');
exports.getAllStaffMembers = factory.getAll(Staff);
exports.deleteStaff = factory.deleteOne(Staff);
exports.updateStaff = factory.updateOne(Staff);
exports.getStaff = factory.getOne(Staff);
exports.createStaff = factory.createOne(Staff);
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `/${__dirname}/../public/photos/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerFilter = (req, file, cb) => {
 if (file.mimetype.startsWith('image')) {
   cb(null, true);
 } else {
   cb(new AppError('Not an image! Please upload only images.', 400), false);
 }
};

const upload = multer({
 storage: multerStorage,
 fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
 // 1) Create error if user POSTs password data
 if (req.body.password || req.body.passwordConfirm) {
   return next(
     new AppError(
       "This route is not for password updates. Please use /updateMyPassword.",
       400
     )
   );
 }

 // 2) Filtered out unwanted fields names that are not allowed to be updated
 const filteredBody = filterObj(req.body, "name", "email", "about");
 if (req.file) filteredBody.photo = req.file.filename;

 // 3) Update user document
 const updatedUser = await Staff.findByIdAndUpdate(
   req.user.id,
   filteredBody,
   {
     new: true,
     runValidators: true,
   }
 );

 res.status(200).json({
   status: "success",
   data: updatedUser,
 });
});

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
