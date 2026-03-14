const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // All notes routes are protected

// @route   POST api/notes
// @desc    Create a note
router.post('/', notesController.createNote);

// @route   GET api/notes
// @desc    Get all user's notes
router.get('/', notesController.getNotes);

// @route   GET api/notes/:id
// @desc    Get note by ID
router.get('/:id', notesController.getNoteById);

// @route   PUT api/notes/:id
// @desc    Update a note content/title
router.put('/:id', notesController.updateNote);

// @route   DELETE api/notes/:id
// @desc    Delete a note
router.delete('/:id', notesController.deleteNote);

// @route   POST api/notes/:id/collaborators
// @desc    Add collaborator to note
router.post('/:id/collaborators', notesController.addCollaborator);

module.exports = router;
