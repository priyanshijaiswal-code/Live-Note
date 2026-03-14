const Note = require('../models/Note');
const User = require('../models/User');

exports.createNote = async (req, res) => {
  try {
    const newNote = new Note({
      title: req.body.title || 'Untitled Note',
      content: req.body.content || '',
      owner: req.user.id,
      collaborators: []
    });

    const note = await newNote.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getNotes = async (req, res) => {
  try {
    // Get notes where user is owner OR a collaborator
    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).sort({ updatedAt: -1 });
    
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('collaborators', 'name email avatar');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check permissions
    if (note.owner.id !== req.user.id && !note.collaborators.some(c => c.id === req.user.id)) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(note);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Note not found' });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateNote = async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check permissions
    if (note.owner.toString() !== req.user.id && !note.collaborators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    note = await note.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner can delete
    if (note.owner.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Only the owner can delete this note' });
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Note not found' });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addCollaborator = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Only owner can add collaborators
    if (note.owner.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Only the owner can add collaborators' });
    }

    const { email } = req.body;
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (note.collaborators.includes(userToAdd.id)) {
       return res.status(400).json({ message: 'User is already a collaborator' });
    }

    note.collaborators.push(userToAdd.id);
    await note.save();

    res.json(note.collaborators);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}
