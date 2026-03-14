const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/notes', require('./src/routes/notes.routes'));
app.use('/api/ai', require('./src/routes/ai.routes'));
app.use('/api/comments', require('./src/routes/comments.routes'));

app.get('/', (req, res) => {
  res.send('Live Notes API Server Running');
});

// Store room presences
const roomUsers = new Map();

// Socket.io for Real-time Collaboration
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Track which room a socket is in
  socket.currentRoom = null;
  socket.userData = null;

  // Room joining for specific documents
  socket.on('join-document', (documentId, user) => {
    // Leave previous room if any
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      const usersInPrevRoom = roomUsers.get(socket.currentRoom) || [];
      const updatedPrevUsers = usersInPrevRoom.filter(u => u.socketId !== socket.id);
      roomUsers.set(socket.currentRoom, updatedPrevUsers);
      io.to(socket.currentRoom).emit('presence-update', updatedPrevUsers);
    }

    socket.join(documentId);
    socket.currentRoom = documentId;
    socket.userData = user || { name: 'Anonymous', color: '#b026ff' };
    
    console.log(`${socket.id} joined document: ${documentId}`);

    // Update room maps
    const usersInRoom = roomUsers.get(documentId) || [];
    // Ensure no duplicates
    const filteredUsers = usersInRoom.filter(u => u.socketId !== socket.id);
    filteredUsers.push({ socketId: socket.id, ...socket.userData });
    roomUsers.set(documentId, filteredUsers);

    // Broadcast current users to everyone in the room
    io.to(documentId).emit('presence-update', filteredUsers);
  });

  // Handle document changes
  socket.on('send-changes', (documentId, delta) => {
    socket.to(documentId).emit('receive-changes', delta);
  });
  
  // Handle cursor positions
  socket.on('cursor-move', (documentId, cursorData) => {
    socket.to(documentId).emit('cursor-update', {
      socketId: socket.id,
      ...cursorData
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.currentRoom) {
      const usersInRoom = roomUsers.get(socket.currentRoom) || [];
      const updatedUsers = usersInRoom.filter(u => u.socketId !== socket.id);
      roomUsers.set(socket.currentRoom, updatedUsers);
      io.to(socket.currentRoom).emit('presence-update', updatedUsers);
      
      // Emit event to remove cursor of disconnected user
      io.to(socket.currentRoom).emit('cursor-remove', socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/livenotes';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
