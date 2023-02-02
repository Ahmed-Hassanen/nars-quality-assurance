const path = require('path');
const express = require("express");
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
app.enable('trust proxy');
app.use(cookieParser());

app.use(express.json());
app.use(helmet());
app.use(
  express.urlencoded({
    extended: true,
  })
);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/users', userRouter);


app.all('*', (req, res, next) => {
  // const err = new Error(`can't find ${req.originalUrl} on this server `);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can't find ${req.originalUrl} on this server `, 404));
});

app.use(globalErrorHandler);


module.exports = app;
