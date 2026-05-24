const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    } 
});

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('📱 User connected:', socket.id);
    
    // Broadcast sound event to all connected users
    socket.on('play-sound', (soundType) => {
        console.log('🔊 Playing sound:', soundType, 'from', socket.id);
        io.emit('play-sound', soundType);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('👋 User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Open from phone: http://<YOUR_LAPTOP_IP>:${PORT}`);
});
