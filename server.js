require("dotenv").config();
const key = process.env.PENDING_PINATA_KEY;
const secret = process.env.PENDING_PINATA_SECRET;
const platform_storage_key = process.env.REACT_APP_PINATA_KEY;
const platform_storage_secret = process.env.REACT_APP_PINATA_SECRET;
const path = require('path');
const socketIO = require('socket.io');
const express = require('express');
const axios = require('axios');
const https = require('https');
const app = express();
const publicPath = path.join(__dirname, 'build');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));
app.use(express.static("public"));
app.use(express.json());

app.post('/tx-mined', async (req, res) => {
   const _res = await txMined(req);
   res.status(200).end(); 
});

app.post('/tx-rejected', async(req, res) => {
   //const _res = await txRejected(req);
   res.status(200).end(); 
});

app.get('/', (req, res) => {
   res.sendFile(path.join(publicPath, 'index.html'));
});

const server = app.listen(port, () => {
   console.log('Server is up!');
});

const pinJSONToIPFS = async(JSONBody) => {
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
              data_hash: response.data.IpfsHash,
              pinata_url: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
          };
       })
       .catch(function (error) {
           return {
               success: false,
               message: error.message,
           }

   });
};

const getPinList = (query_str) => {
   const url = `https://api.pinata.cloud/data/pinList?${query_str}`;
   return axios
       .get(url, {
           headers: {
               pinata_api_key: key,
               pinata_secret_api_key: secret
           }
       })
       .then(function (response) {
           return response.data.rows;
       })
       .catch(function (error) {
           return [];
       });
};

const removePinFromIPFS = (hashToUnpin) => {
   const url = `https://api.pinata.cloud/pinning/unpin/${hashToUnpin}`;
   return axios
       .delete(url, {
           headers: {
               pinata_api_key: key,
               pinata_secret_api_key: secret
           }
       })
       .then(function (response) {
           return {
               success: true,
               message: response.message,
           }
       })
       .catch(function (error) {
           return {
               success: false,
               message: error.message,
           }
       });
};

const getPinataJSON = (ipfs_pin_hash) => {
   const url = "https://gateway.pinata.cloud/ipfs/"+ipfs_pin_hash;
   io.emit('mined-tx-mint', url);
   return axios
   .get(url, {
       headers: {
           pinata_api_key: key,
           pinata_secret_api_key: secret
       }
   })
   .then(function (response) {
       return response.data.rows;
   })
   .catch(function (error) {
       return [];
   });
}

const io = socketIO(server);

io.on('connection', (socket) => {
   socket.emit('Greeting', 'Welcome');
   socket.on('disconnect', () => console.log('Client disconnected'));
   socket.on('minted', async (mint_tx) => {
      const res = await pinJSONToIPFS(mint_tx);
   });
});

function minedMint(token_name){
   io.emit('mined-tx-mint', 'Your NFT ' + token_name + 'was successfully minted');
}

function rejectedMint(token_name){
   io.emit('rejected-tx-minted', 'Your NFT ' + token_name + 'could not be minted');
}

async function txMined(req) {
   const tx = req.body;
   const pinata_tx = await getPinList("status=pinned&metadata[name]="+tx.hash);
   let res;
   if(pinata_tx.length > 0){
      const pinata_tx_data = await getPinataJSON(pinata_tx[0].ipfs_pin_hash);
      io.emit('mined-tx-mint', pinata_tx_data);
      switch(pinata_tx_data.type){
         case "mint":
            //minedMint(pinata_tx_data.nft_name);
            res = await removePinFromIPFS(pinata_tx[0].ipfs_pin_hash);
            break;
      }
   }
}

async function txRejected(req) {
   const tx = JSON.stringify(req.body);
   const tx_hash = tx.fullTransaction.hash;
   const pinata_tx = await getPinList("status=pinned&metadata[name]="+tx_hash);
   let res;
   if(pinata_tx.length > 0){
      const pinata_tx_data = await pinatagetPinataJSON(pinata_tx[0].ipfs_pin_hash);
      switch(pinata_tx_data.type){
         case "mint":
            rejectedMint(pinata_tx_data.token_name);
            res = await removePinFromIPFS(pinata_tx[0].ipfs_pin_hash);
            break;
      }
   }
}
