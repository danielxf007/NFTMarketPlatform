import { useEffect, useState } from "react";
import "./Market-Place.css";
import {
    connectWallet,
    getCurrentWalletConnected,
    BuyNFTOnMarket
} from "./util/interact.js";

import {getMetadata, getMarketOffers} from "./util/pinata";


const MarketPlaceCell = (props) => {

    const onBuyPressed = async() => {
        if(props.walletAddress.length > 0){
            let {succes, status} = await BuyNFTOnMarket(props.token_id, props.token_price);
            console.log(status)
        }
    };

    return (
        <div className="cell">
            <h2>{props.name}</h2>
            <img src={props.link} width="75" height="75"/>
            <h2>{props.price}</h2>
            <button onClick={onBuyPressed}>Buy</button>
        </div>
    );
}

const MarketPlace = (props) => {
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
    const [sell_items, setSellItems] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
    useEffect(async () => {
        const { address, status } = await getCurrentWalletConnected();
        const { sucess, data }= await getMarketOffers();
        let offer_metadata;
        let nft_metadata;
        let items = []
        for(let i=0; i<data.length; i++){
            items.push(new Object())
            offer_metadata = data[i].metadata.keyvalues;
            items[i].price = offer_metadata.price;
            items[i].token_id = offer_metadata.id;
            let nft_metadata_res = await getMetadata(offer_metadata.uri.replace("https://gateway.pinata.cloud/ipfs/", ""));
            nft_metadata = nft_metadata_res.metadata;
            items[i].name = nft_metadata.name;
            items[i].link = nft_metadata.keyvalues.image_url;
        }
        const n = 100;
        console.log('0x'+n.toString(16));
        console.log(items[0]);
        setSellItems(items);
        setWallet(address);
        setStatus(status);
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
            <div className="row">
            <MarketPlaceCell
                walletAddress={walletAddress}
                token_id = {sell_items[0].token_id}
                token_price = {sell_items[0].price}
                name={sell_items[0].name}
                link={sell_items[0].link}
                price={sell_items[0].price + " WEI"}/>
            <MarketPlaceCell
                walletAddress={walletAddress}
                token_id = {sell_items[1].token_id}
                token_price = {sell_items[1].price}
                name={sell_items[1].name}
                link={sell_items[1].link}
                price={sell_items[1].price + " WEI"}/>
            <MarketPlaceCell
                walletAddress={walletAddress}
                token_id = {sell_items[2].token_id}
                token_price = {sell_items[2].price}
                name={sell_items[2].name}
                link={sell_items[2].link}
                price={sell_items[2].price + " WEI"}/>
            </div>

        </div>
    );
}

export default MarketPlace;