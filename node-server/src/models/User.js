const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null }, // null for OAuth users
  avatar: { type: String, default: '' },
  provider: { type: String, default: 'local', enum: ['local', 'google', 'apple', 'microsoft', 'github', 'twitter'] },
  providerId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
