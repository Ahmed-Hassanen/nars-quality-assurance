const Student = require("../models/studentModel");
const factory = require("./../shared/controllers/handlerFactory");
const catchAsync = require("./../shared/utils/catchAsync");
const AppError = require("./../shared/utils/appError");
const multer = require('multer');
exports.getStudent = factory.getOne(Student);
exports.getAllStudents = factory.getAll(Student);
exports.updateStudent = factory.updateOne(Student);
exports.deleteStudent = factory.deleteOne(Student);
exports.createStudent = factory.createOne(Student);

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
  const updatedUser = await Student.findByIdAndUpdate(
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
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};