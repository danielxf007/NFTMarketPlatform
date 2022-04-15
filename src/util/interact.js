import { pinFileToIPFS, getOfferMadeForNFT, getPublishedOffer} from "./pinata";
import {
  usedName, tokenExists, canTradeToken,
  sellPublished, tokenSold, auctionPublished,
  auctionFinished, isAuctionSeller, isHighestBidder,
  isBidEnough, hasBidded, hasWinner} from "./validations";
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

export const checkNFTStatus = async(token_name) => {
  let published;
  published = await sellPublished(token_name);
  if(published){
    return "Your NFT is being sold";
  }
  published = await auctionPublished(token_name);
  if(published){
    return "Your NFT is being auctioned"
  }
  return "Your NFT is idle"
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
  const contract_metadata = contracts_metadata.shop;
  const shop_has_rights = await canTradeToken(token_name, contract_metadata.address);
  if(!shop_has_rights){
    return{
      success: false,
      status: "You have not given rights to the shop to sell your NFT"
    };
  }
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

export const getPublishedSells = async() => {
  const contract_metadata = contracts_metadata.shop;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  try{
    return contract.methods.getPublishedSells().call();
  }catch(_err){
    return [];
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
  const published = await auctionPublished(token_name);
  if(published){
    return{
      success: false,
      status: "This auction has been already published"
    }
  }
  const contract_metadata = contracts_metadata.auction;
  const has_rights = await canTradeToken(token_name, contract_metadata.address);
  if(!has_rights){
    return{
      success: false,
      status: "You have not given rights to auction your NFT"
    };
  }
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .publish(token_name, end_date, active_time)
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
              expire_date: end_date,
              type: "auction_publish"
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

export const getActiveAuctions = async() => {
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  try{
    
    return contract.methods.getAuctions().call();
  }catch(_err){
    return [];
  }     
}

export const getAuctionHighestBid = async() => {
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  try{
    return contract.methods.getHighestBid().call();
  }catch(_err){
    return 0;
  }    
} 

export const bidNFT = async(token_name, bid) => {
  const published = await auctionPublished(token_name);
  if(published){
    return{
      success: false,
      status: "This auction has been already published"
    }
  }
  const auction_finished = await auctionFinished(token_name);
  if(auction_finished){
    return{
      success: false,
      status: "This auction has finished"
    }
  }
  const auction_seller = await isAuctionSeller(token_name, window.ethereum.selectedAddress);
  if(auction_seller){
    return{
      success: false,
      status: "Sellers cannot bid"
    }
  }
  const highest_bidder = await isHighestBidder(token_name, window.ethereum.selectedAddress);
  if(highest_bidder){
    return{
      success: false,
      status: "Highest bidders cannot bid again"
    }
  }
  const enough = await isBidEnough(token_name, window.ethereum.selectedAddress, bigInt(parseFloat(bid)*wei).toString(16));
  if(enough){
    return{
      success: false,
      status: "The bid is not enough"
    }
  }
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
    return{
      success: true,
      tx:{
          pinataMetadata: {
              name: String(txHash)
          },
          pinataContent: {
              name: token_name,
              type: "bid"
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

export const withdrawBid = async(token_name) => {
  const has_bid = await hasBidded(token_name, window.ethereum.selectedAddress);
  if(!has_bid){
    return{
      success: false,
      status: "You did not bid for this NFT"
    }
  }
  const highest_bidder = await isHighestBidder(token_name, window.ethereum.selectedAddress);
  if(highest_bidder){
    return{
      success: false,
      status: "Highest bidders cannot withdraw their bid"
    }
  }
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .withdrawBid(token_name)
      .encodeABI()
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
              type: "withdraw_bid"
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

export const collectAuction = async(token_name) => {
  const published = await auctionPublished(token_name);
  if(!published){
    return{
      success: false,
      status: "This auction has been retired"
    }
  }
  const auction_finished = await auctionFinished(token_name);
  if(!auction_finished){
    return{
      success: false,
      status: "This auction has not finished"
    }
  }
  const auction_seller = await isAuctionSeller(token_name, window.ethereum.selectedAddress);
  const highest_bidder = await isHighestBidder(token_name, window.ethereum.selectedAddress);
  if(!auction_seller && !highest_bidder){
    return{
      success: false,
      status: "You cannot collect because you are not the seller nor the highest bidder of this NFT"
    }
  }
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .collectAuction(token_name)
      .encodeABI()
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
              type: "collect_auction"
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

export const renewAuction = async(token_name, end_date, active_time) => {
  const token_exists = await tokenExists(token_name);
  if(!token_exists){
    return {
      success: false,
      status: "This token does not exist",
    };    
  }
  const published = await auctionPublished(token_name);
  if(!published){
    return{
      success: false,
      status: "This auction has not been published"
    }
  }
  const auction_finished = await auctionFinished(token_name);
  if(!auction_finished){
    return{
      success: false,
      status: "This auction has not finished"
    }
  }
  const has_winner = await hasWinner(token_name);
  if(has_winner){
    return{
      success: false,
      status: "Someone has won the auction"
    }
  }
  const contract_metadata = contracts_metadata.auction;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .renew(token_name, end_date, active_time)
      .encodeABI()
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
              type: "renew_auction"
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