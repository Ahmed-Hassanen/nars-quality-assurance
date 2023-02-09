const axios = require("axios");
const { promisify } = require("util");
const JWT = require("jsonwebtoken");
const AppError = require("../utils/appError");

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    console.log("User is " + req.user.role);
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

    // 3) Check if user still exists
    const data = await axios
      .post(`http://users:8080/is-restricted`, {
        id: decoded.id,
        roles: roles,
        userRole: req.user.role,
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
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    } else {
      next();
    }
  };
};
