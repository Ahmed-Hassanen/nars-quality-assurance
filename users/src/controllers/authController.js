const crypto = require("crypto");
const { promisify } = require("util");
const JWT = require("jsonwebtoken");
const Student = require("../models/studentModel");
const Staff = require("../models/staffModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signupWithEmail = catchAsync(async (req, res, next) => {
  const user = await Staff.findOne({ email: req.body.email }) || await Student.findOne({ email: req.body.email })
  if(!user) return next(new AppError(`there is no user with this => ${req.body.email} email address`, 404));

    const resetToken = user.createPasswordResetToken();
    await staffUser.save({ validateBeforeSave: false });
  
    const message = `that email for verifing your account pls copy this code ${resetToken} in verification page`;
    try {
      await sendEmail({
        email: user.email,
        subject: "your code (Valid for 10m)",
        message,
      });
  
      res.status(200).json({
        status: "success",
        message: "code sent to mail",
      });
    } catch (err) {
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError("there aws an error sending the email. try again later", 500)
      );
    }
});
exports.completeSignup = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user =
    (await Staff.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() },
    })) ||
    (await Student.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() },
    }));

  if (!user) {
    return next(new AppError("code is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  await user.save();

  createSendToken(user, 200, req, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const userPassword = await Staff.findOne({ password: req.body.password }) || await Student.findOne({ password: req.body.password })
  const userEmail = await Staff.findOne({ email: req.body.email }) || await Student.findOne({ email: req.body.email })
  if (!userEmail || !userPassword) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await Staff.findOne({ email:userEmail }).select('+password') || await Student.findOne({ email:userEmail }).select('+password') ;

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user =
    (await Staff.findOne({ email: req.body.email })) ||
    (await Student.findOne({ email: req.body.email }));
  console.log(user);
  if (!user) {
    return next(new AppError("there is no user with email address", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `forgot your Password? your reset password code is 
  ${resetToken}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset token (Valid for 10m)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "token sent to mail",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("there aws an error sending the email. try again later", 500)
    );
  }
});

exports.verifyCode = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user =
    (await Staff.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() },
    })) ||
    (await Student.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() },
    }));

  if (!user) {
    return next(new AppError("code is invalid or has expired", 400));
  }
  res.status(200).json({
    status: "success",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user =
    (await Staff.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() },
    })) ||
    (await Student.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() },
    }));

  if (!user) {
    return next(new AppError("code is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});
