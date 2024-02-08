const router = require("express").Router();
const { Post, User, Comment } = require("../models");
const sequelize = require("../config/connection");

// Route to retrieve all posts ('/')
router.get("/", async (req, res) => {
  try {
    // Retrieve all posts from the database including associated comments and authors
    const postData = await Post.findAll({
      attributes: ["id", "title", "content", "createdAt"],
      include: [
        {
          model: Comment,
          attributes: ["id", "comment", "postId", "userId", "createdAt"],
          include: {
            model: User,
            attributes: ["username"],
          },
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
      // Order posts by their creation date in descending order
      order: [["createdAt", "DESC"]],
    });
    // Serialize retrieved data
    const posts = postData.map((post) => post.get({ plain: true }));
    console.log(posts);
    // Respond with template to render along with retrieved data
    res.render("homepage", {
      posts,
      loggedIn: req.session.loggedIn,
      username: req.session.username,
      userId: req.session.userId,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route to retrieve a single post by ID ('/post/:id')
router.get("/post/:id", async (req, res) => {
  try {
    // Find a post by its ID along with its associated comments and author
    const postData = await Post.findOne({
      where: { id: req.params.id },
      attributes: ["id", "content", "title", "createdAt"],
      include: [
        {
          model: Comment,
          attributes: ["id", "comment", "postId", "userId", "createdAt"],
          include: {
            model: User,
            attributes: ["username"],
          },
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });
    // If the post exists, render the single-post view with the post data
    if (postData) {
      const post = postData.get({ plain: true });
      console.log(post);
      res.render("singlepost", {
        post,
        loggedIn: req.session.loggedIn,
        username: req.session.username,
      });
    } else {
      // If no post found for the given ID, send a 404 status code and JSON object
      res.status(404).json({ message: "No post found for this id." });
      return;
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route to render the login page
router.get("/login", (req, res) => {
  // Redirect to homepage if already logged in
  if (req.session.loggedIn) {
    res.redirect("/");
    return;
  }
  // Render the login view
  res.render("login");
});

// Route to render the signup page
router.get("/signup", async (req, res) => {
  // Render the signup view
  res.render("signup");
});

module.exports = router;
