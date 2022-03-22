require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contracts_metadata = require("../contracts/contracts_metadata.json");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

export const getAuctionTimeLeft = async(token_id) => {
  const contract_metadata = contracts_metadata.auction;
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  let time_left = 0;
  try{
    time_left = contract.methods.getAuctionTimeLeft(token_id).call();
    return time_left;
  }catch(err){
    return time_left;
  }
};

export const getAuctionHighestBid = async(token_id) => {
  const contract_metadata = contracts_metadata.auction;
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  let highest_bid = 0;
  try{
    highest_bid = contract.methods.getHighestBid(token_id).call();
    return highest_bid;
  }catch(err){
    return highest_bid;
  }
};

export const getAuctionHighestBidder = async(token_id) => {
  const contract_metadata = contracts_metadata.auction;
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  let highest_bidder = 0;
  try{
    highest_bidder = contract.methods.getAuctionHighestBidder(token_id).call();
    return highest_bidder;
  }catch(err){
    return highest_bidder;
  }
};

export const getAuctionData = async(token_id) => {
  const contract_metadata = contracts_metadata.auction;
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    let auction_data = {};
    try{
        auction_data["highest_bid"] = await contract.methods.getAuctionHighestBid(token_id).call();
        auction_data["highest_bidder"] = await contract.methods.getAuctionHighestBidder(token_id).call();
      return auction_data;
    }catch(err){
      return auction_data;
    }      
};

export const getAuctionReturn = async(token_id) => {
  const contract_metadata = contracts_metadata.auction;
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .getReturn(token_id)
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
      "Your withdraw was accepted, wait until the transaction is processed"
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
};