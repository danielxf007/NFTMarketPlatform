require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contracts_metadata = require("../contracts/contracts_metadata.json");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

export const usedName = async(token_name) => {
    const contract_metadata = contracts_metadata.minter;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.usedName(token_name).call();
}

export const tokenExists = async(token_name) => {
    const contract_metadata = contracts_metadata.minter;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.exists(token_name).call();
}

export const canTradeToken = async(token_name, user_address) => {
    const contract_metadata = contracts_metadata.minter;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.canTrade(token_name, user_address).call();   
}

export const sellPublished = async(token_name) => {
    const contract_metadata = contracts_metadata.shop;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.published(token_name).call();  
}

export const tokenSold = async(token_name) => {
    const contract_metadata = contracts_metadata.shop;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.sold(token_name).call();     
}

export const offersEnough = async(token_name, offer) => {
    const contract_metadata = contracts_metadata.shop;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.isEnough(token_name, offer).call();      
}

export const auctionPublished = async(token_name) => {
    const contract_metadata = contracts_metadata.auction;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.published(token_name).call();  
}

export const auctionFinished = async(token_name) => {
    const contract_metadata = contracts_metadata.auction;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.auctionFinished(token_name).call();  
}

export const isAuctionSeller = async(token_name, user_address) => {
    const contract_metadata = contracts_metadata.auction;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.isAuctionSeller(token_name, user_address).call();
}

export const isHighestBidder = async(token_name, user_address) => {
    const contract_metadata = contracts_metadata.auction;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.isHighestBidder(token_name, user_address).call();
}

export const isBidEnough = async(token_name, user_address, value) => {
    const contract_metadata = contracts_metadata.auction;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.isBidEnough(token_name, user_address, value).call();
}

export const hasBidded = async(token_name, user_address) => {
    const contract_metadata = contracts_metadata.auction;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.hasBidded(token_name, user_address).call();
}

export const hasWinner = async(token_name) => {
    const contract_metadata = contracts_metadata.auction;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.hasWinner(token_name).call();
}
