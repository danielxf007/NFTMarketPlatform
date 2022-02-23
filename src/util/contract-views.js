require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contractABI = require("../contracts/abi.json");
const contractAddress = "0x2ec735ce14bd4bd82e562a4522ec6c3e713b5a5f";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

export const getAuctionData = async(token_id) => {
    const contract = await new web3.eth.Contract(contractABI, contractAddress);
    let auction_data = {};
    try{
        auction_data["highest_bid"] = await contract.methods.getAuctionHighestBid(token_id).call();
        auction_data["highest_bidder"] = await contract.methods.getAuctionHighestBidder(token_id).call();
        auction_data["min_bid"] = await contract.methods.getAuctionMinBid(token_id).call();
        auction_data["time_left"] = await contract.methods.getAuctionTimeLeft(token_id).call();
      return auction_data;
    }catch(err){
      return auction_data;
    }      
};