const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mqtt = require('mqtt');
const app = express();
const port = 3010;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // To support JSON-encoded bodies

// Use session middleware
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// MQTT client options
const mqttOptions = {
  clientId: `mqttx_${Math.random().toString(16).slice(2)}`,
  username: 'your name',
  password: 'your password',
  clean: true,
};

const brokerUrl = 'mqtt://broker.emqx.io';
const client = mqtt.connect(brokerUrl, mqttOptions);
let chatHistory = [];

client.on('connect', () => {
  console.log('MQTT client connected');
  client.subscribe('chatMessage', (err) => {
    if (err) {
      console.error('Error subscribing to topic:', err);
    }
  });
});

client.on('message', (topic, message) => {
  console.log('Received message:', message.toString());
  try {
    const parsedMessage = JSON.parse(message.toString());
    chatHistory.push(parsedMessage); // Store the entire message object
  } catch (e) {
    console.error('Error parsing message:', e);
  }
});

client.on('error', (err) => {
  console.error('MQTT client error:', err);
});

function publishData(data) {
  client.publish('chatMessage', JSON.stringify(data), (err) => {
    if (err) {
      console.error('Error publishing data:', err);
    }
  });
}

// Route to display login page
app.get('/login', (req, res) => {
  res.render('login');
});


// Route to handle login
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username) {
    req.session.username = username;
    res.redirect('/');
  } else {
    res.status(400).send('Username is required');
  }
});

// Middleware to ensure the user is logged in
app.use((req, res, next) => {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login');
  }
});

// Route to return the chat history as JSON
app.get('/chat-history', (req, res) => {
  res.json({ chatHistory });
});

// Route to return the chat history as JSON
app.get('/display', (req, res) => {
  res.json({ chatHistory });
});

// Route to render the chat dashboard view
app.get('/', (req, res) => {
  res.render('dashboard', { chatHistory, username: req.session.username });
});

// Route to handle message submissions
app.post('/submit', (req, res) => {
  const { message } = req.body;
  const username = req.session.username;
  if (message && username) {
    publishData({ message, username });
    res.json({ status: "success", message: "Message sent" });
  } else {
    res.status(400).json({ status: "error", message: "Message or username not provided" });
  }
});

// Listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
