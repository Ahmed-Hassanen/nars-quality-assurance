const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const AppError = require("./shared/utils/appError");
const cookieParser = require("cookie-parser");
const courseRoute = require("./routes/courseRoute");
const globalErrorHandler = require("./shared/controllers/errorController");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Kafka } = require("kafkajs");

const app = express();

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.enable("trust proxy");
app.use(cookieParser());

app.use(express.json());
app.use(helmet());
app.use(cors());
app.options("*", cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/", courseRoute);

app.all("*", (req, res, next) => {
  next(
    new AppError(`can't find ${req.originalUrl} on this course server `, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
