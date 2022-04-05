require("dotenv").config();
const key = process.env.PENDING_PINATA_KEY;
const secret = process.env.PENDING_PINATA_SECRET;
const path = require('path');
const socketIO = require('socket.io');
const express = require('express');
const pinata = require("./src/util/pinata.js");
const app = express();
const publicPath = path.join(__dirname, 'build');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));
app.use(express.static("public"));
app.use(express.json());

app.post('/tx-mined', (req, res) => {
   txMined(req);
   res.status(200).end(); 
});

app.post('/tx-rejected', (req, res) => {
   txRejected(req);
   res.status(200).end(); 
});

app.get('/', (req, res) => {
   res.sendFile(path.join(publicPath, 'index.html'));
});

const server = app.listen(port, () => {
   console.log('Server is up!');
});

const io = socketIO(server);

io.on('connection', (socket) => {
   socket.emit('Greeting', 'Welcome');
   socket.on('minted', async (mint_tx) => {
      const res = await pinata.pinFileToIPFS(mint_tx, key, secret);
   });
});

function minedMint(token_name){
   socket.emit('mined-tx-mint', 'Your NFT ' + token_name + 'was successfully minted');
}

function rejectedMint(token_name){
   socket.emit('rejected-tx-minted', 'Your NFT ' + token_name + 'could not be minted');
}

async function txMined(req) {
   const tx = JSON.stringify(req.body);
   const tx_hash = tx.fullTransaction.hash;
   const pinata_tx = await pinata.getPinList("status=pinned&metadata[name]="+tx_hash, key, secret);
   let res;
   if(pinata_tx.length > 0){
      const pinata_tx_data = await pinata.getPinataJSON(pinata_tx[0].ipfs_pin_hash);
      switch(pinata_tx_data.type){
         case "mint":
            minedMint(pinata_tx_data.token_name);
            res = await pinata.removePinFromIPFS(pinata_tx[0].ipfs_pin_hash, key, secret);
            break;
      }
   }
}

async function txRejected(req) {
   const tx = JSON.stringify(req.body);
   const tx_hash = tx.fullTransaction.hash;
   const pinata_tx = await pinata.getPinList("status=pinned&metadata[name]="+tx_hash, key, secret);
   let res;
   if(pinata_tx.length > 0){
      const pinata_tx_data = await pinata.getPinataJSON(pinata_tx[0].ipfs_pin_hash);
      switch(pinata_tx_data.type){
         case "mint":
            rejectedMint(pinata_tx_data.token_name);
            res = await pinata.removePinFromIPFS(pinata_tx[0].ipfs_pin_hash, key, secret);
            break;
      }
   }
}
