const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ note_id: req.params.noteId })
      .populate('user_id', 'name avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addComment = async (req, res) => {
  try {
    const { noteId, text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const newComment = new Comment({
      note_id: noteId,
      user_id: req.user.id,
      comment: text
    });

    const comment = await newComment.save();
    
    // Populate user info before returning
    const populatedComment = await Comment.findById(comment._id).populate('user_id', 'name avatar');
    
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the owner of the comment
    if (comment.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
