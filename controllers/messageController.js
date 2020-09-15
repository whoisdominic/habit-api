const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const client = require("twilio")(process.env.accountSid, process.env.authToken);

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

// This route notifies the buddy that they have been added to the habit, invites them to download the app!
router.post("/welcome", authCheck, async (req, res) => {
  const buddieInfo = req.body;
  console.log(buddieInfo);
  try {
    const request = await client.messages.create({
      body: `\nHey! Your friend ${buddieInfo.userName} has invited you to help them track their new habit! \n \n${buddieInfo.userName} would like to ${buddieInfo.habitGoal}! \n \nDownload HabitHunter on testFlight to help!`,
      from: "+12057829268",
      to: buddieInfo.buddyPhone,
    });
    res.status(200).json(request);
  } catch (error) {
    console.log(error);
  }
});

router.post("/progress/:habitId", authCheck, async (req, res) => {
  const buddieInfo = req.body;
  const userLookup = buddieInfo.userToken;
  console.log(buddieInfo);
  try {
    const request = await client.messages.create({
      body: `\nHey! Your friend ${buddieInfo.userName} has made some progress on their habit of ${buddieInfo.habitGoal}`,
      from: "+12057829268",
      to: buddieInfo.buddyPhone,
    });
    res.status(200).json(request);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", authCheck, async (req, res) => {
  try {
    res.status(200).json({ msg: "Here for Messages" });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
