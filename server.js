
require("dotenv").config();
const key = process.env.PENDING_PINATA_KEY;
const secret = process.env.PENDING_PINATA_SECRET;
const socketIO = require('socket.io');
const axios = require('axios');
const fetch = require('node-fetch');

const path = require('path');

const express = require('express');

const app = express();
const publicPath = path.join(__dirname, 'build');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));
app.use(express.static("public"));
app.use(express.json());


app.post('/tx-mined', async (req, res) => {
    minedTx(JSON.stringify(req));
    res.status(200).end(); 
});

/*
app.post('/tx-rejected', async(req, res) => {
   const _res = await txRejected(req);
   res.status(200).end(); 
});
*/

app.get('/', (req, res) => {
   res.sendFile(path.join(publicPath, 'index.html'));
});

const server = app.listen(port, () => {
   console.log('Server is up!');
});
/*
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
*/
const io = socketIO(server);
io.on('connection', (socket) => {
    socket.on('disconnect', () => console.log('Client disconnected'));
    /*
    socket.on('made_tx', async (tx) => {
        const res = await pinJSONToIPFS(tx);
    });
    */
});

function minedTx(message){
    io.emit('mined-tx', message);
}
/*

function rejectedTx(message){
    io.emit('rejected-tx', message);
}

async function txMined(req){
    try{
        const tx = req.body;
        const pinata_tx = await getPinList("status=pinned&metadata[name]="+tx.hash);
        if(pinata_tx.length > 0){
            const pinata_tx_data = await getPinataJSON(pinata_tx[0].ipfs_pin_hash);
            switch(pinata_tx_data.type){
                case "mint":  
                    minedTx('Your NFT ' + pinata_tx_data.name + ' was successfully minted');
                    break;
                case "rights":
                    minedTx('Your NFT ' + pinata_tx_data.name + ' can be published on the market now');
                    break;
                case "sell_publish":
                    minedTx('Your NFT ' + pinata_tx_data.name + ' was published on the market by: ' + pinata_tx_data.price + ' ETH' );
                    break;
                case 'buy_nft':
                    minedTx('Your offer of '+ pinata_tx_data.price + ' ETH for '+ pinata_tx_data.name + ' was accepted');
                    break;
                case 'auction_publish':
                    minedTx('Your NFT ' + pinata_tx_data.name + ' was published on the auction board until: ' + pinata_tx_data.expire_date);
                    break;
                case 'bid':
                    minedTx('Your bid for: ' + pinata_tx_data.name + ' has been accepted');
                    break;
                case 'withdraw_bid':
                    minedTx('Your bid for: ' + pinata_tx_data.name + ' has been withdrawed');
                    break;
                case 'collect_auction':
                    minedTx('Your have collected the auction for ' + pinata_tx_data.name);
                    break;
                case 'renew_auction':
                    minedTx('Your auction for ' + pinata_tx_data.name + 'has been renewed');
                    break;                
            }
        }
        res = await removePinFromIPFS(pinata_tx[0].ipfs_pin_hash);
    }catch(err){
        console.log(err.message);
    }
}

async function txRejected(req){
    try{
        const tx = req.body;
        const pinata_tx = await getPinList("status=pinned&metadata[name]="+tx.hash);
        if(pinata_tx.length > 0){
           const pinata_tx_data = await getPinataJSON(pinata_tx[0].ipfs_pin_hash);
           switch(pinata_tx_data.type){
                case "mint":  
                    rejectedTx('You could not mint ' + pinata_tx_data.name + ' try again');
                    break;
                case "rights":
                    rejectedTx('You could not give rights to sell ' + pinata_tx_data.name + ' try again');
                    break;
                case "sell_publish":
                    rejectedTx('Your could not publish a sell for ' + pinata_tx_data.name + ' try again');
                    break;
                case 'buy_nft':
                    rejectedTx('Your could not buy ' + pinata_tx_data.name + ' try again');
                    break;
                case 'auction_publish':
                    rejectedTx('Your could not publish the auction for ' + pinata_tx_data.name + ' try again');
                    break;
                case 'bid':
                    rejectedTx('Your bid for: ' + pinata_tx_data.name + ' has been rejected');
                case 'withdraw_bid':
                    rejectedTx('You could not withdraw your bid for: ' + pinata_tx_data.name + ' try again');
                    break;
                case 'collect_auction':
                    rejectedTx('Your could not collect the auction for ' + pinata_tx_data.name + ' try again');
                    break;
                case 'renew_auction':
                    rejectedTx('Your could not renew the auction for ' + pinata_tx_data.name + ' try again'); 
           }
        }
        res = await removePinFromIPFS(pinata_tx[0].ipfs_pin_hash);
    }catch(err){
        console.log(err.message);
    }

}
*/