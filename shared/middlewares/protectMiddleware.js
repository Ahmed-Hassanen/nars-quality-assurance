const axios = require("axios");
const { promisify } = require("util");
const JWT = require("jsonwebtoken");
const AppError = require("../utils/appError");

exports.protect = async (req, res, next) => {
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

  if (!token || token == "loggedout") {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  console.log("Token is " + token);
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  console.log("Id is " + decoded.id);

  // 3) Check if user still exists
  const data = await axios
    .post(`http://users:8080/is-protected`, {
      id: decoded.id,
    })
    .then((res) => res.data)
    .catch((e) => {
      return {
        status: false,
        message: "something went wrong",
        code: 500,
      };
    });

  if (data.status === false) {
    return next(new AppError(data.message, data.code));
  }

  console.log("Protected user is " + JSON.stringify(data.user));

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = data.user;
  res.locals.user = data.user;
  next();
};
