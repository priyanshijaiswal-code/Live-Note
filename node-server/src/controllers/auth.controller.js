const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, name, email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// OAuth login/register — creates user if not exists
exports.oauthLogin = async (req, res) => {
  try {
    const { name, email, provider, providerId, avatar } = req.body;
    if (!name || !email || !provider) {
      return res.status(400).json({ message: 'name, email, and provider are required' });
    }

    // Find by email OR provider+providerId
    let user = await User.findOne({ email });

    if (!user) {
      // Create new OAuth user (no password)
      user = new User({
        name,
        email,
        password: null,
        provider,
        providerId: providerId || null,
        avatar: avatar || '',
      });
      await user.save();
    } else {
      // Update provider info if signing in via OAuth for the first time
      if (user.provider === 'local') {
        user.provider = provider;
        user.providerId = providerId || null;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, provider } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
