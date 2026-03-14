const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
