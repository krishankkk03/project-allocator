import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import router from './routes.js';
import connectDB, { Message } from './db.js';

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

// Pass io to request so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', router);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        roomId: data.roomId,
        senderId: data.senderId,
        senderName: data.senderName,
        text: data.text
      });
      await newMessage.save();
      
      // Emit the saved message (with its MongoDB _id and timestamp)
      io.to(data.roomId).emit('receive_message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
