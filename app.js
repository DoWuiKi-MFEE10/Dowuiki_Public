var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mapRouter = require('./routes/map');
var memberPageRouter = require('./routes/memberPage');
// var api = require('./routes/api.js');
var blogapiRouter = require('./routes/blogapi')
var articlePage = require('./routes/articlePage');
var adminRouter = require('./routes/admins');



var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'dowuikiprojectusesessionkey',
    resave: true,
    saveUninitialized: true,
    //設定session秒數(微秒)
    cookie: { maxAge: 36 * 1000000 }
}))


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/map', mapRouter);
// app.use('/api', api);
app.use('/member', memberPageRouter);
app.use('/public', express.static('public'));
app.use('/blogapi', blogapiRouter);
app.use('/articlePage', articlePage);
app.use('/admin', adminRouter);


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