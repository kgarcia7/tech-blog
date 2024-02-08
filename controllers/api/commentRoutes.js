const router = require("express").Router();
const { Comment } = require("../../models");
const withAuth = require("../../utils/auth");

// Route to get all comments ('api/comment')
router.get("/", async (req, res) => {
  try {
    // Find all comments
    const commentData = await Comment.findAll({});
    // If no comments found, send a 404 status code and JSON object
    if (commentData.length === 0) {
      res.status(404).json({ message: "No comments found." });
      return;
    }
    res.status(200).json(commentData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route to get all comments from a specific post ('api/comment/:id')
router.get("/:id", async (req, res) => {
  try {
    // Find all comments associated with the provided post ID
    const commentData = await Comment.findAll({
      where: { postId: req.params.id },
    });
    // If no comments found for the given post ID, send a 404 status code and JSON object
    if (commentData.length === 0) {
      res
        .status(404)
        .json({
          message: `No comments found for post with id ${req.params.id}.`,
        });
      return;
    }
    res.status(200).json(commentData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route to create a new comment ('/api/comment')
router.post("/", withAuth, async (req, res) => {
  const body = req.body;
  try {
    // Create a new comment associated with the authenticated user
    const newComment = await Comment.create({
      ...body,
      userId: req.session.userId,
    });
    res.status(200).json({ newComment, success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route to delete a comment ('api/comment/:id')
router.delete("/:id", withAuth, async (req, res) => {
  try {
    // Delete the comment with the provided ID
    const commentData = await Comment.destroy({
      where: { id: req.params.id },
    });
    // If no comment found for the given ID, send a 404 status code and JSON object
    if (!commentData) {
      res
        .status(404)
        .json({ message: `No comment found with id ${req.params.id}.` });
      return;
    }
    res.status(200).json({ commentData, success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
