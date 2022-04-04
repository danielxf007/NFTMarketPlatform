const path = require('path');
const socketIO = require('socket.io');
const express = require('express');
const { consumers } = require('stream');
const app = express();
const publicPath = path.join(__dirname, 'build');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));
app.use(express.static("public"));
app.use(express.json());

app.post('/alchemyhook', (req, res) => {
   notificationReceived(req); res.status(200).end() 
});

app.get('/', (req, res) => {
   res.sendFile(path.join(publicPath, 'index.html'));
});

const server = app.listen(port, () => {
   console.log('Server is up!');
});

// start the websocket server
const io = socketIO(server);

// listen for client connections/calls on the WebSocket server
io.on('connection', (socket) => {
   socket.emit('Greeting', 'Hello');
});

// notification received from Alchemy from the webhook. Let the clients know.
function notificationReceived(req) {
  io.emit('notification', JSON.stringify(req.body));
}

