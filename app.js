const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const connectDB = require('./src/db');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const pretestRouter = require('./routes/pretest');
const posttestRouter = require('./routes/posttest');
const demographicRouter = require('./routes/demographic');
const passport = require('passport');

const app = express();

if(process.env.NODE_ENV == 'development')
  require('dotenv').config({ path: './config.env' })

connectDB();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(passport.initialize())
app.use(passport.session())

// if(app.get('env') === 'development')
//   var delay = require('express-delay');
//   app.use(delay(2000))
  
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/pretest', pretestRouter);
app.use('/posttest', posttestRouter);
app.use('/demographic', demographicRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
