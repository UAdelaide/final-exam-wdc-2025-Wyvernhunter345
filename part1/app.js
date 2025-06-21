var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

let dbConnectionPool;

(async () => {
  try {
    var connection = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    await connection.query('DROP DATABASE IF EXISTS DogWalkService');
    await connection.query('CREATE DATABASE DogWalkService');
    await connection.end();

    dbConnectionPool = await mysql.createPool({
      host: 'localhost',
      database: 'DogWalkService',
      user: 'root',
      password: ''
    });

    await dbConnectionPool.execute(`DROP TABLE IF EXISTS Users`);
    await dbConnectionPool.execute(`CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'walker') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);
  console.log("got here");

    await dbConnectionPool.execute(`DROP TABLE IF EXISTS Dogs`);
    await dbConnectionPool.execute(`CREATE TABLE Dogs (
    dog_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    size ENUM('small', 'medium', 'large') NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
)`);

    await dbConnectionPool.execute(`DROP TABLE IF EXISTS WalkRequests`);
    await dbConnectionPool.execute(`CREATE TABLE WalkRequests (
      request_id INT AUTO_INCREMENT PRIMARY KEY,
      dog_id INT NOT NULL,
      requested_time DATETIME NOT NULL,
      duration_minutes INT NOT NULL,
      location VARCHAR(255) NOT NULL,
      status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
  )`);

    await dbConnectionPool.execute(`DROP TABLE IF EXISTS WalkApplications`);
    await dbConnectionPool.execute(`CREATE TABLE WalkApplications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    walker_id INT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
    FOREIGN KEY (walker_id) REFERENCES Users(user_id),
    CONSTRAINT unique_application UNIQUE (request_id, walker_id)
)`);

    await dbConnectionPool.execute(`DROP TABLE IF EXISTS WalkRatings`);
    await dbConnectionPool.execute(`CREATE TABLE WalkRatings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    walker_id INT NOT NULL,
    owner_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
    FOREIGN KEY (walker_id) REFERENCES Users(user_id),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id),
    CONSTRAINT unique_rating_per_walk UNIQUE (request_id))`);

    await dbConnectionPool.execute(`INSERT INTO Users (username, email, password_hash, role) VALUES
    ("alice123", "alice@example.com", "hashed123", "owner"),
    ("bobwalker", "bob@example.com", "hashed456", "walker"),
    ("carol123", "carol@example.com", "hashed789", "owner"),
    ("Syndix01", "syndix@example.com", "anotherhash", "owner"),
    ("Isaac2014", "isaac@example.com", "yetanotherhash", "walker")`);

    await dbConnectionPool.execute(`INSERT INTO Dogs (owner_id, name, size) VALUES
    ((SELECT user_id FROM Users WHERE username = "alice123"), "Max", "medium"),
    ((SELECT user_id FROM Users WHERE username = "carol123"), "Bella", "small"),
    ((SELECT user_id FROM Users WHERE username = "Syndix01"), "Badga", "small"),
    ((SELECT user_id FROM Users WHERE username = "Syndix01"), "Jits", "medium"),
    ((SELECT user_id FROM Users WHERE username = "Isaac2014"), "Guppy", "large")`);

    await dbConnectionPool.execute(`INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
    ((SELECT dog_id FROM Dogs WHERE name = "Max"), "2025-06-10 08:00:00", 30, "Parklands", "open"),
    ((SELECT dog_id FROM Dogs WHERE name = "Bella"), "2025-06-10 09:30:00", 45, "Beachside Ave", "accepted"),
    ((SELECT dog_id FROM Dogs WHERE name = "Guppy"), "2025-06-28 13:30:00", 30, "Esplanade", "accepted"),
    ((SELECT dog_id FROM Dogs WHERE name = "Jits"), "2025-07-10 17:45:00", 60, "Civic Park", "completed"),
    ((SELECT dog_id FROM Dogs WHERE name = "Badga"), "2025-07-08 12:00:00", 40, "Botanical Gardens", "completed")`);

    await dbConnectionPool.execute(`INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
    (4, "2025-06-10 08:00:00", 30, "Parklands", "open"),
    (5, "2025-06-10 09:30:00", 45, "Beachside Ave", "accepted")`);
  }
  catch (e)
  {
    console.error("Could not set up database!");
  }
})();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
  req.pool = dbConnectionPool;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req,res,next){
  req.pool = dbConnectionPool;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

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
