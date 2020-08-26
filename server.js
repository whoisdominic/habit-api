//////////////////////////
// Dependencies
//////////////////////////
const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const cors = require("cors");
require("dotenv").config();

//////////////////////////
// Globals
//////////////////////////
const whitelist = ["http://localhost:19002", "https://goatranker.com"];

const corsOptions = (req, callback) => {
  let corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};
//////////////////////////
// Database
//////////////////////////

const db = mongoose.connection;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/habithunterv1";

//...farther down the page

// Error / Disconnection
mongoose.connection.on("error", (err) =>
  console.log(err.message + " is Mongod not running?")
);
mongoose.connection.on("disconnected", () => console.log("mongo disconnected"));

//...farther down the page

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("connected to mongoose...");
});

/// Controllers
const usersController = require("./controllers/usersController.js");

//////////////////////////
// Models
//////////////////////////

const User = require("./models/userSchema.js");

//////////////////////////
// Middleware
//////////////////////////

// app.use(cors(corsOptions)); // cors middlewear, configured by
app.use(express.json());
app.use(express.static("build"));

app.use("/users", usersController);
////////////////
//Authorization Middleware
////////////////

const authCheck = (req, res, next) => {
  if (req.session.currentUser) {
    return next();
  } else {
    res.redirect("/");
  }
};

//////////////////////////
// API
//////////////////////////
// All controllers go here

// End controllers

app.get("/", (req, res) => {
  res.send("Hello Hunter");
});

//////////////////////////
// Listener
//////////////////////////
app.listen(PORT, () => console.log("Listening on port:", PORT));
