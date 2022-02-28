require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contractABI = require("../contracts/abi.json");
const contractAddress = "0xf80de0c6d9043a0fc2b63cd75b8d794e28714216";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

export const getAuctionTimeLeft = async(token_id) => {
  const contract = await new web3.eth.Contract(contractABI, contractAddress);
  let time_left = 0;
  try{
    time_left = contract.methods.getAuctionTimeLeft(token_id).call();
    return time_left;
  }catch(err){
    return time_left;
  }
};

export const getAuctionHighestBid = async(token_id) => {
  const contract = await new web3.eth.Contract(contractABI, contractAddress);
  let highest_bid = 0;
  try{
    highest_bid = contract.methods.getAuctionHighestBid(token_id).call();
    return highest_bid;
  }catch(err){
    return highest_bid;
  }
};

export const getAuctionHighestBidder = async(token_id) => {
  const contract = await new web3.eth.Contract(contractABI, contractAddress);
  let highest_bidder = 0;
  try{
    highest_bidder = contract.methods.getAuctionHighestBidder(token_id).call();
    return highest_bidder;
  }catch(err){
    return highest_bidder;
  }
};

export const getAuctionData = async(token_id) => {
    const contract = await new web3.eth.Contract(contractABI, contractAddress);
    let auction_data = {};
    try{
        auction_data["highest_bid"] = await contract.methods.getAuctionHighestBid(token_id).call();
        auction_data["highest_bidder"] = await contract.methods.getAuctionHighestBidder(token_id).call();
      return auction_data;
    }catch(err){
      return auction_data;
    }      
};