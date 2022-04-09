import { pinFileToIPFS, getOfferMadeForNFT, getPublishedOffer} from "./pinata";
import {getTokenUri} from "./contract-interactions";
import {usedName, tokenExists, canTradeToken, sellPublished, tokenSold} from "./validations";
require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contracts_metadata = require("../contracts/contracts_metadata.json");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
var bigInt = require("big-integer");
const wei = bigInt(1000000000000000000);

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const mintNFT = async (image, token_name) => {
  if (token_name === "") {
    return {
      success: false,
      status: "You need to gave a name to your NFT.",
    };
  }
  const used_name = await usedName(token_name);
  if(used_name){
    return{
      success: false,
      status: "This name has already been used"
    }    
  }
  const file_res = await pinFileToIPFS(image, token_name);
  if (!file_res.success){
    return {
      success: false,
      status: "Something went wrong while uploading your file.",
    };
  }
  if(file_res.duplicated){
    return{
      success: false,
      status: "This image has already been minted"
    };
  }
  const contract_metadata = contracts_metadata.minter;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .mintNFT(token_name, file_res.pinata_url, window.ethereum.selectedAddress)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters]
    });
    return {
      success: true,
      tx:{
          pinataMetadata: {
              name: String(txHash)
          },
          pinataContent: {
              name: token_name,
              data_hash: file_res.data_hash,
              type: "mint"
          }
        },
      status: "Your transaction was sent"
    };
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong: " + error.message,
    };
  }
};

export const getTokens = async() => {
  const contract_metadata = contracts_metadata.minter;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  try{
    return contract.methods.getTokens(window.ethereum.selectedAddress).call();
  }catch(_err){
    return [];
  }  
};

export const giveRights = async(token_name, beneficiary) => {
  const token_exists = await tokenExists(token_name);
  if(!token_exists){
    return {
      success: false,
      status: "This token does not exist",
    };    
  }
  const can_trade = await canTradeToken(token_name, window.ethereum.selectedAddress);
  if(!can_trade){
    return{
      success: false,
      status: "You cannot trade this token"
    };
  }
  const contract_metadata = contracts_metadata.minter;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods
      .giveRights(token_name, beneficiary)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      tx:{
          pinataMetadata: {
              name: String(txHash)
          },
          pinataContent: {
              name: token_name,
              type: "rights"
          }
        },
      status: "Your transaction was sent"
    };
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong: " + error.message,
    };
  }
}

export const publishSell = async(token_name, token_price) => {
  if(parseFloat(token_price) === 0.0) {
    return {
      success: false,
      status: "The price cannot be zero.",
    };
  }
  const token_exists = await tokenExists(token_name);
  if(!token_exists){
    return {
      success: false,
      status: "This token does not exist",
    };    
  }
  const can_trade = await canTradeToken(token_name, window.ethereum.selectedAddress);
  if(!can_trade){
    return{
      success: false,
      status: "You cannot trade this token"
    };
  }
  const published = await sellPublished(token_name);
  if(published){
    return{
      success: false,
      status: "This token is already been sold"
    }
  }
  const sold = await tokenSold(token_name);
  if(sold){
    return{
      success: false,
      status: "This token was already sold"
    };
  }
  const token_uri = await getTokenUri(token_name);
  const contract_metadata = contracts_metadata.shop;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .publishSell(token_name, bigInt(parseFloat(token_price)*wei).toString())
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return{
      success: true,
      tx:{
          pinataMetadata: {
              name: String(txHash)
          },
          pinataContent: {
              name: token_name,
              image_url: token_uri,
              price: token_price,
              type: "sell_publish"
          }
        },
      status: "Your transaction was sent"
    };
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong: " + error.message
    };
  }
}

export const buyNFT = async(token_name, token_price) => {
  const sold = await tokenSold(token_name);
  if(sold){
    return{
      success: false,
      status: "This token was already sold"
    };
  }
  const offer_made = await getOfferMadeForNFT(token_name);
  if(offer_made.length > 0){
    return{
      success: false,
      status: "Someone has already made an offer fot this NFT, try again later if the offer made was rejected"
    };
  }
  const sell_data = await getPublishedOffer(token_name);
  if(sell_data.length > 0){
    alert(sell_data[0].ipfs_pin_hash);
  }
  const contract_metadata = contracts_metadata.shop;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    value: bigInt(parseFloat(token_price)*wei).toString(16),
    data: window.contract.methods
      .buy(token_name)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      tx:{
          pinataMetadata: {
              name: String(txHash),
              keyvalues: {
                name: token_name,
                type: "buy_nft"
              }
          },
          pinataContent: {
              name: token_name,
              price: token_price,
              type: "buy_nft"
          }
        },
      status: "Your transaction was sent"
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong " + error.message
    };
  }
}


export const publishAuction = async(token_name, end_date, active_time) => {
  /*
  console.log(active_time);
  let data = {};
  data.pinataMetadata = {
  name: "NFT_AUCTION"
  };
  const token_uri = await getTokenUri(token_name);
  if(token_uri === null){
    return {
      success: false,
      status: "❗This token does not exist",
    };    
  }
  data.pinataContent = {
    name: token_name,
    image: token_uri,
    date: end_date,
  };
  const pinataJsonPinResponse = await pinJSONToIPFS(data);
  if (!pinataJsonPinResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while publishing your auction.",
    };
  }
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address, 
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .publish(token_name, active_time)
      .encodeABI(),
  };

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        "Your auction was accepted, wait until the transaction finishes" +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
  */
}



export const bidNFT = async(token_name, bid) => {
  /*
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    value: bigInt(parseFloat(bid)*wei).toString(16),
    data: window.contract.methods
      .bid(token_name)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    
    return {
      success: true,
      status:
        "Your bid was accepted wait until is confirmed"
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong",
    };
  } 
*/
}

export const collectAuction = async(token_id) => {
  /*
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .collectAuction(token_id)
      .encodeABI()
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
}

export const withdrawBid = async(token_id) => {
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .withdrawBid(token_id)
      .encodeABI()
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
  */
}

export const renewAuction = async(token_id, active_time) => {
  /*
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .renew(token_id, active_time)
      .encodeABI()
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
  */
}


export const getJSON = async(ipfs_pin_hash) => {
  /*
  const response = await fetch("https://gateway.pinata.cloud/ipfs/"+ipfs_pin_hash);
  return response.json(); // get JSON from the response
  */ 
}

