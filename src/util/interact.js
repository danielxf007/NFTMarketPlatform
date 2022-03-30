import { pinJSONToIPFS, pinFileToIPFS, removePinFromIPFS, getPinList} from "./pinata.js";
import {getTokenUri} from "./contract-interactions"; 
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
  if (token_name.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    };
  }
  const query_res = await getPinList("status=pinned&metadata[name]=" + token_name);
  if(query_res.length){
    return{
      success: false,
      status: "❗ This name has already been used"
    }
  }
  const file_res = await pinFileToIPFS(image, token_name);
  if (!file_res.success){
    return {
      success: false,
      status: "😢 Something went wrong while uploading your file.",
    };
  }
  if(file_res.duplicated){
    return{
      success: false,
      status: "❗ This image has already been minted"
    };
  }
  const contract_metadata = contracts_metadata.minter;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods
      .mintNFT(token_name, window.ethereum.selectedAddress, file_res.pinata_url)
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
        "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    const remove_file_res = await removePinFromIPFS(file_res.data_hash);
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
};

export const publishSell = async(token_name, token_price) => {
  if (parseFloat(token_price) === 0.0) {
    return {
      success: false,
      status: "❗The price cannot be zero.",
    };
  }
  const token_uri = await getTokenUri(token_name);
  if(token_uri === null){
    return {
      success: false,
      status: "❗This token does not exist",
    };    
  }
  let data = {};
  data.pinataMetadata = {
  name: "NFT_SELL"
  };
  data.pinataContent = {
    name: token_name,
    image: token_uri,
    price: token_price
  };
  const json_res = await pinJSONToIPFS(data);
  if (!json_res.success) {
    return {
      success: false,
      status: "😢 Something went wrong while publishing your sell.",
    };
  }
  const contract_metadata = contracts_metadata.shop;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods
      .publishSell(token_name, bigInt(parseFloat(token_price)*wei).toString())
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
        "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    const remove_json_res = await removePinFromIPFS(json_res.data_hash);
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message
    };
  }
}


export const publishAuction = async(token_name, end_date, active_time) => {
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
}

export const BuyNFTOnMarket = async(token_name, token_price) => {
  console.log(token_name)
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
      status:
        "Purchased"
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong "
    };
  } 
}

export const bidNFT = async(token_name, bid) => {
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

}

export const collectAuction = async(token_id) => {
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
}

export const renewAuction = async(token_id, active_time) => {
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
}


export const getJSON = async (url) => {
  const response = await fetch(url);
  return response.json(); // get JSON from the response 
}

