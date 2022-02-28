import { pinJSONToIPFS, pinFileToIPFS} from "./pinata.js";
require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contractABI = require("../contracts/abi.json");
const contractAddress = "0xf80de0c6d9043a0fc2b63cd75b8d794e28714216";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

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

export const mintNFT = async (image, token_name, token_description, mint_number) => {
  if (token_name.trim() === "" || token_description.trim() === "" || mint_number === 0) {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    };
  }
  const pinataFilePinResponse = await pinFileToIPFS(image);
  if (!pinataFilePinResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your file.",
    };
  }
  let data = {};
  data.pinataMetadata = {
  name: token_name
  };
  data.pinataContent = {
  name: token_name,
  description: token_description,
  image_url: pinataFilePinResponse.pinataUrl
  };
  const pinataJsonPinResponse = await pinJSONToIPFS(data);
  if (!pinataJsonPinResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    };
  }
  const tokenURI = pinataJsonPinResponse.pinataUrl;

  window.contract = await new web3.eth.Contract(contractABI, contractAddress);

  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods
      .mintNFT(window.ethereum.selectedAddress, tokenURI, mint_number)
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
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
};

export const publishSell = async(token_id, token_price) => {
  if (token_price === 0) {
    return {
      success: false,
      status: "❗The price cannot be zero.",
    };
  }
  let data = {};
  data.pinataMetadata = {
  name: "NFT_SELL"
  };
  const token_uri = await getTokenUri(token_id);
  if(token_uri === null){
    return {
      success: false,
      status: "❗This token does not exist",
    };    
  }
  data.pinataContent = {
    uri: token_uri,
    id: token_id,
    price: token_price
  };
  const pinataJsonPinResponse = await pinJSONToIPFS(data);
  if (!pinataJsonPinResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while publishing your NFT.",
    };
  }
  window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods
      .publishSell(token_price, token_id)
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
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
}


export const publishAuction = async(active_time, token_id) => {
  let data = {};
  data.pinataMetadata = {
  name: "NFT_AUCTION"
  };
  const token_uri = await getTokenUri(token_id);
  console.log(token_uri);
  if(token_uri === null){
    return {
      success: false,
      status: "❗This token does not exist",
    };    
  }
  data.pinataContent = {
    uri: token_uri,
    id: token_id,
  };
  const pinataJsonPinResponse = await pinJSONToIPFS(data);
  if (!pinataJsonPinResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while publishing your NFT.",
    };
  }
  window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  const transactionParameters = {
    to: contractAddress,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .publishAuction(active_time, token_id)
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
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
}

export const BuyNFTOnMarket = async(token_id, token_price) => {
  window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    value: parseInt(token_price).toString(16),
    data: window.contract.methods
      .buyNFT(token_id)
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
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  } 
}

export const bidNFT = async(token_id, bid) => {
  window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  console.log(window.ethereum.selectedAddress);
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    value: parseInt(bid).toString(16),
    data: window.contract.methods
      .bidNFT(token_id)
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

export const getTokenUri = async(token_id) => {
  const contract = await new web3.eth.Contract(contractABI, contractAddress);
  try{
    return contract.methods.tokenURI(token_id).call();
  }catch(err){
    return null;
  }
}

export const getTimeLeft = async(token_id) => {
  const contract = await new web3.eth.Contract(contractABI, contractAddress);
  try{
    return contract.methods.getAuctionTimeLeft(token_id).call();
  }catch(err){
    return null;
  }  
}
