import { pinJSONToIPFS, pinFileToIPFS, getMetadata} from "./pinata.js";
require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contractABI = require("../contract-abi.json");
const contractAddress = "0xd854f58d9bbf1e00f599cf3011bc30cbe1527d03";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const wey_gwei = 10;
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
            <a target="_blank" href={`https://metamask.io/download.html`}>
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
    /*
    const meta_data = await getMetadata("QmU6ute6c5VBjeooVKQaXSzXG47XXVEeKxc7T7faijK4ep");
      const data = new Object();
      data.pinataMetadata = {
      name: "MarketSellData",
      keyvalues:{
        sells: 0 
        }
      };
      data.pinataContent = {
        name: "MarketSellData",
        sells: 0
    }
    const pinataJsonPinResponse = await pinJSONToIPFS(data);
    */
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
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

async function loadContract() {
  return new web3.eth.Contract(contractABI, contractAddress);
}

export const mintNFT = async (image, token_name, token_description, mint_number) => {
  if (token_name.trim() == "" || token_description.trim() == "" || mint_number === 0) {
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
  const data = new Object();
  data.pinataMetadata = {
  name: token_name,
  keyvalues:{
    description: token_description,
    image_url: pinataFilePinResponse.pinataUrl}
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

export const publishOnMarket = async(token_uri, token_id, token_price) => {
  if (token_uri.trim() === "" || token_price === 0) {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    };
  }
  const data = new Object();
  data.pinataMetadata = {
  name: "NFT_SELL",
  keyvalues:{
    type: 0,
    uri: token_uri,
    id: token_id,
    price: token_price
    }
  };
  data.pinataContent = {
    name: "NFT_SELL",
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
      .publishNFT(token_price, token_id)
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
  console.log(parseInt(token_price).toString(16));
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