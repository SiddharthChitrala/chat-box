const express = require('express');
const cors = require('cors');
const app = express();
const Pusher = require('pusher');
const mongoose = require('mongoose');
const Message = require('./models/message'); // Import your Message model

const pusher = new Pusher({
  appId: "1673480",
  key: "9a5470d17ebacab25ff0",
  secret: "8ea825fedc4659524394",
  cluster: "ap2",
  useTLS: true
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200'],
}));

app.use(express.json());

// MongoDB Connection Setup
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.post('/msg', async (req, res) => {
  try {
    const { username, message } = req.body;

    // Save the message to MongoDB
    const newMessage = new Message({
      username,
      message,
    });

    await newMessage.save();

    // Trigger the Pusher event
    await pusher.trigger('chat', 'message', {
      username,
      message,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ _id: -1 }).limit(10); // Retrieve the latest 10 messages

    res.json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Error retrieving messages' });
  }
});

console.log('Listening to port 8000');

app.listen(8000);
