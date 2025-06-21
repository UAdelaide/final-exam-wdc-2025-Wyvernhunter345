const express = require("express");
const path = require("path");
var session = require("express-session");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
// Okay who forgot to put the body parser middleware here. I genuinely spent like 30 mins trying to debug login
// I'm gonna crash out I swear
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        secret: "e49650aedb782dc8b735bbc59ad23c49ebd80afff53e6a8db2d7c7eece1568390075a4cc0d83a32f3dc656d1ebf246a7f8a619d119a0bc6ee0c9ed7fae1cc12e",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // should be true when dealing with HTTPS
    })
);

// Routes
const walkRoutes = require("./routes/walkRoutes");
const userRoutes = require("./routes/userRoutes");
const dogRoutes = require("./routes/dogRoutes");

app.use("/api/walks", walkRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dogs", dogRoutes);

// Export the app instead of listening here
module.exports = app;
