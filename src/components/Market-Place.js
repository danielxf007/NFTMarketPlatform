import { useEffect, useState } from "react";
import './Board.css';

import {
    connectWallet,
    getCurrentWalletConnected,
    BuyNFTOnMarket,
    getJSON
} from "../util/interact";

import {
  getMarketOffers,
  removePinFromIPFS
} from "../util/pinata";



const MarketPlaceCell = (props) => {
    const onBuyPressed = async() => {
        if(props.walletAddress.length > 0){
            const {success, status} = await BuyNFTOnMarket(props.token_id, props.token_price);
            let unpin_response;
            if(success){
              unpin_response = await removePinFromIPFS(props.pin_hash);
            }
        }
    };

    return (
        <div className="nft-item">
          <div className="nft-name">
            {props.name}
          </div>
          <img className="nft-image" src={props.link}/>
          <div className="nft_price">
            {props.price}
          </div>
          <div>
            <button onClick={onBuyPressed}>Buy</button>
          </div>
        </div>
    );
}

const MarketPlace = (props) => {
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
    const [sell_items, setSellItems] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);

  useEffect(() => {
      const f = async() => {
        const { address, status } = await getCurrentWalletConnected();
        const { sucess, data } = await getMarketOffers();
        const url = "https://gateway.pinata.cloud/ipfs/";
        let sell_data = null;
        let token_data = null;
        let items = []
        for(let i=0; i<data.length; i++){
          items.push({});
          console.log(data[i]);
          sell_data = await getJSON(url+data[i]["ipfs_pin_hash"]);
          console.log(sell_data);
          token_data = await getJSON(sell_data["uri"]);
          items[i].pin_hash = data[i]["ipfs_pin_hash"];
          items[i].link = token_data["image_url"];
          items[i].name = token_data["name"];
          items[i].price = sell_data["price"];
          items[i].token_id = sell_data["id"];
        }
        setSellItems(items);
        setWallet(address);
        setStatus(status);
      }
      f();
      addWalletListener();
    }, []);
    
    
function addWalletListener() {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setWallet(accounts[0]);
        setStatus("👆🏽 Write a message in the text-field above.");
      } else {
        setWallet("");
        setStatus("🦊 Connect to Metamask using the top right button.");
      }
    });
  } else {
    setStatus(
      <p>
        {" "}
        🦊{" "}
        <a target="_blank" href={`https://metamask.io/download.html`}>
          You must install Metamask, a virtual Ethereum wallet, in your
          browser.
        </a>
      </p>
    );
  }
}
    
    const connectWalletPressed = async () => {
        const walletResponse = await connectWallet();
        setStatus(walletResponse.status);
        setWallet(walletResponse.address);
      };

    return (
        <div>
            <button id="walletButton" onClick={connectWalletPressed}>
                {walletAddress.length > 0 ? (
                "Connected: " +
                String(walletAddress).substring(0, 6) +
                "..." +
                String(walletAddress).substring(38)
                ) : (
                <span>Connect Wallet</span>
                )}
            </button> 
            <br></br>
            <div className="nft-item-container">
              {
                sell_items.map((item, index) =>{
                  return <MarketPlaceCell
                          key={String(index)}
                          walletAddress={walletAddress}
                          pin_hash={item["pin_hash"]}
                          token_id={item["token_id"]}
                          token_price={item["price"]}
                          name={item["name"]}
                          link={item["link"]}
                          price={item["price"] + " WEI"}/>
                })
              }
            </div>
        </div>
    );
}

export default MarketPlace;