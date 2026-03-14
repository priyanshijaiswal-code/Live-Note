const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// Mock AI Summarization Endpoint
router.post('/summarize', auth, async (req, res) => {
  try {
    const { noteId } = req.body;
    const note = await Note.findById(noteId);
    
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.content) return res.json({ result: "Please write some content in the note before asking for a summary!" });

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json({ result: `**AI Summary:**\nThis document primarily discusses the following topics based on your text: "${note.content.substring(0, 30)}...". It seems to be a work in progress!` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Mock AI Action Items Endpoint
router.post('/action-items', auth, async (req, res) => {
  try {
    const { noteId } = req.body;
    const note = await Note.findById(noteId);
    
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({ result: `**Action Items Found:**\n1. Review the latest notes.\n2. Fix the database connection.\n3. Deploy the application to production.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Mock AI Chat Endpoint
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({ result: `I see you asked: "${message}". As an AI assistant built for Live Note, I'm here to help you formatting, writing and managing your notes efficiently!` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
