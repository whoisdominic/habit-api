const router = require("express").Router();
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

// Create new buddy
router.post("/add", authCheck, async (req, res) => {
  console.log(req.body);
  try {
    const newBud = await User.findByIdAndUpdate(req.headers.id, {
      $push: {
        buddies: {
          $each: [
            {
              name: req.body.buddyName,
              phoneNumber: req.body.buddyPhone,
            },
          ],
        },
      },
    });
    res.status(200).json(newBud.buddies);
  } catch (error) {
    res.status(400).json({ msg: "Error" });
  }
});

// Update Buddy
router.put("/update/:buddyId", authCheck, async (req, res) => {
  const userId = req.headers.id;
  const buddy = { _id: req.params.buddyId };
  const update = req.body;
  try {
    const updateBuddy = await User.update(
      { "buddies._id": buddy },
      { $set: { "buddies.$": update } }
    );
    res.status(200).json(updateBuddy);
  } catch (error) {
    res.status(400).json(error);
  }
});

// remove buddy
router.delete("/remove/:buddyId", authCheck, async (req, res) => {
  try {
    console.log("params", req.params.buddyId);
    const removedBuddie = await User.findByIdAndUpdate(req.headers.id, {
      $pull: { buddies: { _id: req.params.buddyId } },
    });
    res.status(200).json(removedBuddie);
  } catch (error) {
    res.status(400).json({ msg: error });
  }
});

// Get all buddies
router.get("/all", authCheck, async (req, res) => {
  const request = req.body;
  try {
    console.log(req.headers.id);
    const user = await User.findById(req.headers.id);
    console.log("user", user);
    res.status(200).json({ buddies: user.buddies });
  } catch (error) {
    res.status(400).json({ msg: "here" });
  }
});

router.get("/", authCheck, async (req, res) => {
  res.send("Welcome Buddies");
});

module.exports = router;
