const router = require("express").Router();
const { User, Post, Comment } = require("../../models");
const withAuth = require("../../utils/auth");

// Route to create a new post ('/api/post')
router.post("/", withAuth, async (req, res) => {
  try {
    // Create a new post associated with the authenticated user
    const newPost = await Post.create({
      ...req.body,
      userId: req.session.userId,
    });
    console.log("New post created:", postData);
    res.status(200).json(newPost);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Route to edit a post ('/api/post/:id')
router.put("/:id", withAuth, async (req, res) => {
  try {
    // Update the post with the provided ID
    const updatedPost = await Post.update(
      {
        title: req.body.title,
        content: req.body.content,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    // If no post found for the given ID, send a 404 status code and JSON object
    if (!updatedPost) {
      res.status(404).json({ message: "No post found for this id" });
      return;
    }
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route to delete a post ('/api/post/:id')
router.delete("/:id", withAuth, async (req, res) => {
  try {
    // Delete the post with the provided ID and associated comments
    const commentData = await Comment.destroy({
      where: { postId: req.params.id },
    });

    // Delete the post with the provided ID
    const postData = await Post.destroy({
      where: {
        id: req.params.id,
        userId: req.session.userId,
      },
    });
    // If no post found for the given ID, send a 404 status code and JSON object
    if (!postData) {
      res.status(404).json({
        message: `No post found with id ${req.params.id} associated with User Id ${req.session.userId}`,
      });
      return;
    }
    res.status(200).json(postData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
