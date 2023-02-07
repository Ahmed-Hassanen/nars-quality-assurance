const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const cookieParser = require("cookie-parser");
const surveyRouter = require("./routes/surveysRoute");
const globalErrorHandler = require("./controllers/errorController");
const cors = require("cors");

const app = express();

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

app.use("/", surveyRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server `, 404));
});

app.use(globalErrorHandler);

module.exports = app;
