const router = require("express").Router();
const { User } = require("../../models");
const withAuth = require("../../utils/auth");

// Route to create a new user ('/api/user')
router.post("/", async (req, res) => {
  try {
    const userData = await User.create(req.body);
    // Save user session data
    req.session.save(() => {
      req.session.userId = userData.id;
      req.session.username = userData.username;
      req.session.loggedIn = true;
      res
        .status(201)
        .json({ message: `Account created for ${userData.username}.` });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Route to log in a user ('/api/user/login')
router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { username: req.body.username },
    });
    // If no user found, send a 400 status code and JSON object indicating invalid user
    if (!userData) {
      res.status(400).json({
        message: `Username ${req.body.username} not found.`,
      });
      return;
    }
    // Validate password
    const pwValidated = await userData.checkPassword(req.body.password);
    if (!pwValidated) {
      res
        .status(400)
        .json({ message: "Incorrect password, please try again!" });
      return;
    }
    // Create session and send response back
    req.session.save(() => {
      req.session.userId = userData.id;
      req.session.username = userData.username;
      req.session.loggedIn = true;
      res.status(200).json({ message: "You have successfully logged in!" });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Route to log out a user ('/api/user/logout')
router.post("/logout", withAuth, async (req, res) => {
  try {
    // Check if user is logged in
    if (req.session.loggedIn) {
      await req.session.destroy(() => {
        res.status(204).end();
      });
    } else {
      res.status(404).end();
    }
  } catch {
    res.status(400).end();
  }
});

module.exports = router;
