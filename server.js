require('dotenv').config();
const key = process.env.PENDING_PINATA_KEY;
const secret = process.env.PENDING_PINATA_SECRET;
const path = require('path');
const socketIO = require('socket.io');
const express = require('express');
const axios = require('axios');
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
   socket.emit('Greeting', 'Welcome');
   socket.on('minted', async (mint_tx) => {
      const res = await pinJSONToIPFS(mint_tx);
   });
});

async function pinJSONToIPFS(JSONBody) {
   const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
   return axios 
       .post(url, JSONBody, {
           headers: {
               pinata_api_key: key,
               pinata_secret_api_key: secret,
           }
       })
       .then(function (response) {
          return {
              success: true,
              message: response.message
          };
       })
       .catch(function (error) {
           return {
               success: false,
               message: error.message,
           }

   });
}

// notification received from Alchemy from the webhook. Let the clients know.
async function notificationReceived(req) {
  io.emit('notification', JSON.stringify(req.body));
}

