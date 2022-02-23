import { useEffect, useState } from "react";
import './Board.css';

import {
    getJSON, bidNFT, connectWallet,
    getCurrentWalletConnected
} from "../util/interact";

import {
  getAuctionData
} from "../util/contract-views";

import {
    getAuctionOffers,
    removePinFromIPFS
  } from "../util/pinata";

const BoardCell = (props) => {
    const [bid, setBid] = useState(0);

    useEffect(() => {
      console.log(bid);
    }, []);
    


    const onBuyPressed = async() => {
      console.log(props["token_id"], bid);
      const {success, status} = await bidNFT(props["token_id"], bid);
    };

    return (
        <div className="nft-item">
          <div className="nft-name">
            {props["name"]}
          </div>
          <img className="nft-image" src={props["link"]}/>
          <div className="nft-bid">
            Minimun Bid: {props["min_bid"]}
          </div>
          <div className="nft-bidder">
            Highest Bidder: {props["highest_bidder"]}
          </div>
          <div className="nft-bid">
            Highest Bid: {props["highest_bid"]}
          </div>
          <div className="nft-time-left">
            Time Left: {props["time_left"]}
          </div>
          <form>
            <h2>Make Bid: </h2>
                <input
                type="number"
                placeholder="0"
                onChange={(event) => setBid(event.target.value)}
            />
            </form>
          <div>
            <button onClick={onBuyPressed}>Bid</button>
          </div>
        </div>
    );    
}

const AuctionBoard = (props) => {
  const [auction_items, setAuctionItems] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
  const [status, setStatus] = useState("");
  const [walletAddress, setWallet] = useState("");

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

    useEffect(() => {
        const f = async() => {
          const { address, status } = await getCurrentWalletConnected();
          const { sucess, data } = await getAuctionOffers();
          const url = "https://gateway.pinata.cloud/ipfs/";
          let nft_auction_data = null;
          let token_data = null;
          let items = []
          let auction_data= null;
          for(let i=0; i<data.length; i++){
            items.push({});
            nft_auction_data  = await getJSON(url+data[i]["ipfs_pin_hash"]);
            token_data = await getJSON(nft_auction_data["uri"]);
            auction_data = await getAuctionData(nft_auction_data["id"]);
            console.log(auction_data);
            items[i] = auction_data;
            items[i]["pin_hash"] = data[i]["ipfs_pin_hash"];
            items[i]["token_id"] = nft_auction_data["id"];
            items[i]["name"] = token_data["name"];
            items[i]["link"] = token_data["image_url"];
            
          }
          setAuctionItems(items);
          setWallet(address);
          setStatus(status);
        }
        f();
        addWalletListener();
        console.log(walletAddress)
      }, []);

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
                auction_items.map((item, index) =>{
                  return <BoardCell
                          key={String(index)}
                          pin_hash={item["pin_hash"]}
                          token_id={item["token_id"]}
                          name={item["name"]}
                          link={item["link"]}
                          min_bid={item["min_bid"] + " WEI"}
                          highest_bidder={
                            String(item["highest_bidder"]).substring(0, 6) +
                            "..." +
                            String(item["highest_bidder"]).substring(38)}
                          highest_bid={item["highest_bid"] + " WEI"}
                          time_left={item["time_left"]+ " sec"}
                          />
                })
              }
            </div>
        </div>

    );
}

export default AuctionBoard;