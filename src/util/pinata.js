require('dotenv').config();
const FormData = require('form-data');
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;

const axios = require('axios');

export const pinFileToIPFS = async(image) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', image);
    return axios 
        .post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               data_hash: response.data.IpfsHash, 
               pinata_url: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
               duplicated: response.data.isDuplicate
           };
        })
        .catch(function (error) {
            return {
                success: false,
                message: error.message,
            }

    });
}

export const pinJSONToIPFS = async(JSONBody) => {
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


export const getPinList = (query_str) => {
    const url = `https://api.pinata.cloud/data/pinList?${query_str}`;
    return axios
        .get(url, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret
            }
        })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error.message);
        });
};



export const getMarketOffers = async() => {
    const url = `https://api.pinata.cloud/data/pinList?status=pinned&metadata[name]=NFT_SELL`;
    return axios
        .get(url, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret
            }
        })
        .then(function (response) {
            return {
                success: true,
                data: response.data.rows
            };
        })
        .catch(function (error) {
            return {
                success: false,
                message: error.message,
            }
        });
};

export const getAuctionOffers = async() => {
    const url = `https://api.pinata.cloud/data/pinList?status=pinned&metadata[name]=NFT_AUCTION`;
    return axios
        .get(url, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret
            }
        })
        .then(function (response) {
            return {
                success: true,
                data: response.data.rows
            };
        })
        .catch(function (error) {
            return {
                success: false,
                message: error.message,
            }
        });
};

export const removePinFromIPFS = (hashToUnpin) => {
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