const crypto = require("crypto");
const { promisify } = require("util");
const JWT = require("jsonwebtoken");
const Student = require("../models/studentModel");
const Staff = require("../models/staffModel");
const catchAsync = require("../shared/utils/catchAsync");
const AppError = require("../shared/utils/appError");
const sendEmail = require("../shared/utils/email");

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
  if (!user) {
    return next(new AppError("there is no user with email address", 404));
  }

  const verifyCode = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `forgot your Password? your reset password code is `;
  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset token (Valid for 10m)",
      message,
      verifyCode,
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
    .update(req.body.verifyCode)
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
    .update(req.body.verifyCode)
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

exports.signupWithEmail = catchAsync(async (req, res, next) => {
  const user =
    (await Staff.findOne({ email: req.body.email }).select("+password")) ||
    (await Student.findOne({ email: req.body.email }).select("+password"));
  if (!user)
    return next(
      new AppError(
        `there is no user with this => ${req.body.email} email address`,
        404
      )
    );
  console.log(user);
  if (user.password) {
    return next(new AppError(`that email already signup`, 404));
  }
  const verifyCode = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `that email for verifing your account pls copy this code in verification page`;
  try {
    await sendEmail({
      email: user.email,
      subject: "your verification code (Valid for 10m)",
      message,
      verifyCode,
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
    .update(req.body.verifyCode)
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
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const userPassword = req.body.password;
  const userEmail =
    (await Staff.findOne({ email: req.body.email })) ||
    (await Student.findOne({ email: req.body.email }));

  if (!userEmail || !userPassword) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user =
    (await Staff.findOne({ email: req.body.email }).select("+password")) ||
    (await Student.findOne({ email: req.body.email }).select("+password"));

  if (!user || !(await user.correctPassword(userPassword, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const staffUser = await Staff.findById(decoded.id);
  const studentUser = await Student.findById(decoded.id);
  if (!staffUser && !studentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  const currentUser = staffUser ? staffUser : studentUser;

  // 4) Check if user changed password after the token was issued
  if (currentUser.chagesPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    //check if this user is actually a staff member (to avoid students trying to get around this by passing a role)
    const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
    const staffUser = await Staff.findById(decoded.id);
    if (!staffUser || !roles.includes(staffUser.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
