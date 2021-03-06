const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//////////////////////////
// Models
//////////////////////////

const User = require("../models/userSchema.js");

//////////////////////////
// Middleware
//////////////////////////
// Auth Check
const authCheck = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "No auth token" });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.status(401).json({ msg: "Authorization failed" });

    req.user = verified.id;
    next();
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: error.message });
  }
};

//////////////////////////
// Account Info
//////////////////////////

router.get("/account/", authCheck, async (req, res) => {
  console.log("check header");

  try {
    const findUser = await User.findById(req.header("user_id"));
    console.log(findUser);
    res.status(200).json(findUser);
  } catch (error) {
    res.status(400).json(error);
  }
});

//////////////////////////
// Signup
//////////////////////////

router.post("/signup", async (req, res) => {
  console.log(req);
  try {
    // Destructuring the request body
    let { password, passwordCheck, email, phoneNumber } = req.body;
    console.log(password);
    console.log(passwordCheck);
    console.log(email);
    console.log(phoneNumber);
    // Validations
    if (!email || !password || !passwordCheck || !phoneNumber)
      return res.status(400).json({ msg: "not all fields have been entered" });
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "Password needs to be atleast five characters long!" });
    if (password !== passwordCheck)
      return res.status(400).json({ msg: "Passwords do not match" });

    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "Account with this email already exists" });
    // End Validations
    // Hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // User Create
    const newUser = await User.create({
      email: email,
      password: passwordHash,
      phoneNumber: phoneNumber,
    });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//////////////////////////
// Login
//////////////////////////

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password || !email)
      return res.status(200).json({ msg: "Not all fields have been entered" });
    const user = await User.findOne({ email: email });
    if (!user) return res.status(200).json({ msg: "Account does not exist" });
    const comparePasswords = await bcrypt.compare(password, user.password);
    if (!comparePasswords) {
      return res.status(200).json({ msg: "Wrong Password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.log("at error");
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/delete", authCheck, async (req, res) => {
  // Deletes a user
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.post("/tokenisvalid", async (req, res) => {
  // used on front end: checks if token is valid
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/", authCheck, async (req, res) => {
  try {
    const findUser = await User.findById(req.user);
    res.status(200).json({
      username: findUser.username,
      id: findUser._id,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
