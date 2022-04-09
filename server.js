require("dotenv").config();
const key = process.env.PENDING_PINATA_KEY;
const secret = process.env.PENDING_PINATA_SECRET;
const nft_storage_key = process.env.REACT_APP_PINATA_KEY;
const nft_storage_secret = process.env.REACT_APP_PINATA_SECRET;
const path = require('path');
const socketIO = require('socket.io');
const express = require('express');
const axios = require('axios');
const app = express();
const publicPath = path.join(__dirname, 'build');
const port = process.env.PORT || 3000;
const fetch = require('node-fetch');
const { json } = require("express/lib/response");

app.use(express.static(publicPath));
app.use(express.static("public"));
app.use(express.json());

app.post('/tx-mined', async (req, res) => {
   const _res = await txMined(req);
   res.status(200).end(); 
});

app.post('/tx-rejected', async(req, res) => {
   const _res = await txRejected(req);
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
   const url = 'https://api.pinata.cloud/data/pinList?'+query_str;
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
       .catch(function (_error) {
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

const getPinataJSON = async (ipfs_pin_hash) => {
    try{
        const response = await fetch("https://gateway.pinata.cloud/ipfs/"+ipfs_pin_hash);
        return response.json();
    }catch(error){
        return error.message;
    }
}

const io = socketIO(server);

io.on('connection', (socket) => {
    socket.on('disconnect', () => console.log('Client disconnected'));
    socket.on('made_tx', async (tx) => {
        const res = await pinJSONToIPFS(tx);
    });
});

function minedMint(token_name){
   io.emit('mined-tx-mint', 'Your NFT ' + token_name + ' was successfully minted');
}

function rejectedMint(token_name){
   io.emit('rejected-tx-minted', 'Your NFT ' + token_name + ' could not be minted');
}

function minedGaveRights(token_name){
    io.emit('mined-tx-give-rights', 'Your NFT ' + token_name + ' can be published on the market now');
}
 
function rejectedGaveRights(token_name){
    io.emit('rejected-tx-give-rights', 'Your NFT ' + token_name + 'cannot be published on the market');
}

function minedSellPublish(token_name, price){
    io.emit('mined-tx-sell_publish', 'Your NFT ' + token_name + ' was published on the market by: ' + price + ' ETH');
}
 
 function rejectedSellPublish(token_name){
    io.emit('rejected-tx-sell_publish', 'Your NFT ' + token_name + 'could not be published on the market');
}

function minedBuy(token_name, price){
    io.emit('mined-tx-buy', 'Your offer of '+ price + ' ETH for '+ token_name + ' was accepted');
}
 
 function rejectedBuy(token_name){
    io.emit('rejected-tx-buy', 'Your offer for ' + token_name + 'was rejected');
}

async function txMined(req) {
   const tx = req.body;
   const pinata_tx = await getPinList("status=pinned&metadata[name]="+tx.hash);
   if(pinata_tx.length > 0){
      const pinata_tx_data = await getPinataJSON(pinata_tx[0].ipfs_pin_hash);
      let res;
      let sell_data;
      let data;
      switch(pinata_tx_data.type){
            case "mint":  
                minedMint(pinata_tx_data.name);
                break;
            case "rights":
                minedGaveRights(pinata_tx_data.name);
                break;
            case "sell_publish":
                res = await pinJSONToIPFS({
                    pinataMetadata: {
                        name: "NFT_SELL",
                        keyvalues: {
                            name: pinata_tx_data.name
                        }
                    },
                    pinataContent:{
                        name: pinata_tx_data.name,
                        image_url: pinata_tx_data.image_url,
                        price: pinata_tx_data.price
                    }
                });
                minedSellPublish(pinata_tx_data.name, pinata_tx_data.price);
                break;
            case 'buy_nft':
                break;
                /*
                sell_data = await getPinList("status=pinned&metadata[name]=NFT_SELL"+
                "&metadata[keyvalues][name]="+pinata_tx_data.name);
                io.emit('mined-tx-buy', JSON.stringify(sell_data[0]));
                "&metadata[keyvalues][name]="+pinata_tx_data.name);                
                if(sell_data.length > 0){
                    data = await getPinataJSON(sell_data[0].ipfs_pin_hash);
                    res = await removePinFromIPFS(sell_data[0].ipfs_pin_hash);
                    minedBuy(data.name, data.price);
                }
                */
      }
   }
   res = await removePinFromIPFS(pinata_tx[0].ipfs_pin_hash);
}

async function txRejected(req) {
    const tx = req.body;
    const pinata_tx = await getPinList("status=pinned&metadata[name]="+tx.hash);
    if(pinata_tx.length > 0){
       const pinata_tx_data = await getPinataJSON(pinata_tx[0].ipfs_pin_hash);
       let res;
       let data;
       res = await removePinFromIPFS(pinata_tx[0].ipfs_pin_hash);
       switch(pinata_tx_data.type){
            case "mint":
                rejectedMint(pinata_tx_data.name);
                break;
            case "rights":
                rejectedGaveRights(pinata_tx_data.name);
                break;
            case "sell_publish":
                rejectedSellPublish(pinata_tx_data.name);
                break;
            case 'buy_nft':
                rejectedBuy(pinata_tx_data.name);
       }
    }
}
