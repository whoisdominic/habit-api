const router = require("express").Router();
const jwt = require("jsonwebtoken");
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

// Read All Habits
router.get("/all", authCheck, async (req, res) => {
  const userId = req.headers.id;
  try {
    const findHabits = await User.findById(userId);
    res.status(200).json(findHabits.habits);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Create New Habit = Working
router.post("/new", authCheck, async (req, res) => {
  const userId = req.headers.id;
  try {
    const newHabit = await User.findByIdAndUpdate(userId, {
      $push: {
        habits: {
          $each: [
            {
              goal: req.body.goal,
              daily: req.body.daily,
              weekly: req.body.weekly,
              monthly: req.body.monthly,
              progress: 0,
              buddies: req.body.buddies,
              date: new Date(),
            },
          ],
        },
      },
    });

    res.status(200).json({ msg: "new Habit", habit: newHabit });
  } catch (error) {
    res.status(400).json(error);
  }
});

// Read sinlge Habit
router.get("/:habitId", authCheck, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json(error);
  }
});

// Edit Habit New Habit
router.put("/", authCheck, async (req, res) => {
  try {
    // TODO
  } catch (error) {
    res.status(400).json(error);
  }
});

// Delete Habit

router.delete("/:habitId", authCheck, async (req, res) => {
  try {
    // TODO
  } catch (error) {
    res.status(400).json(error);
  }
});

// Route Test
router.get("/", authCheck, async (req, res) => {
  try {
    res.status(200).json({ msg: "Here for Habits" });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
