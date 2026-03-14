const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// @route   GET api/comments/:noteId
// @desc    Get all comments for a note
router.get('/:noteId', commentsController.getComments);

// @route   POST api/comments
// @desc    Add a comment to a note
router.post('/', commentsController.addComment);

// @route   DELETE api/comments/:id
// @desc    Delete a comment
router.delete('/:id', commentsController.deleteComment);

module.exports = router;
