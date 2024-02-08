const router = require("express").Router();
const { User, Post, Comment } = require("../models");
const withAuth = require("../utils/auth");
const sequelize = require("../config/connection");

// Route to get all posts of the logged-in user ('/dashboard')
router.get("/", withAuth, (req, res) => {
  Post.findAll({
    where: {
      userId: req.session.userId,
    },
    attributes: ["id", "title", "content", "createdAt"],
    order: [["createdAt", "DESC"]],
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
  })
    .then((postData) => {
      // Serialize retrieved data
      const posts = postData.map((post) => post.get({ plain: true }));
      // Render the dashboard view with retrieved data
      res.render("dashboard", {
        posts,
        loggedIn: true,
        username: req.session.username,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Route to get a single post for editing ('/dashboard/edit/:id')
router.get("/edit/:id", withAuth, (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ["id", "title", "content", "createdAt"],
    include: [
      {
        model: User,
        attributes: ["username"],
      },
      {
        model: Comment,
        attributes: ["id", "comment", "postId", "userId", "createdAt"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
    ],
  })
    .then((postData) => {
      // If no post found for the given ID, send a 404 status code and JSON object
      if (!postData) {
        res.status(404).json({ message: "No post found for this id." });
        return;
      }
      // Serialize retrieved data
      const post = postData.get({ plain: true });
      // Render the edit-post view with retrieved data
      res.render("editpost", {
        post,
        loggedIn: true,
        username: req.session.username,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Route to render the form for creating a new post ('/dashboard/new)
router.get("/new", withAuth, (req, res) => {
  // Render the new-post view with the current username
  res.render("newpost", { username: req.session.username });
});

module.exports = router;
