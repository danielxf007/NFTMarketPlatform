import { useEffect, useState } from "react";
import './Board.css';

import {
    getJSON, bidNFT, connectWallet,
    getCurrentWalletConnected
} from "../util/interact";

import {
  getAuctionData, getAuctionTimeLeft, getAuctionHighestBid, getAuctionHighestBidder
} from "../util/contract-views";

import {
    getAuctionOffers,
  } from "../util/pinata";

const BoardCell = (props) => {
  const [date, setDate] = useState(0);
  const [bid, setBid] = useState(0);

  const fetchDate = () => {
    setDate(parseInt(Math.abs(new Date())/1000));
  };

  const onBidPressed = async() => {
    const {success, status} = await bidNFT(props["token_id"], bid);
  };

  const formatTimeLeft = (secs) => {
    let hours = Math.floor(secs / (60 * 60));
    let hours_str = hours < 10? "0"+hours.toString(): hours.toString();

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);
    let minutes_str = minutes < 10? "0"+minutes.toString(): minutes.toString();

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);
    let seconds_str = seconds < 10? "0"+seconds.toString(): seconds.toString();

    return hours_str + " : " + minutes_str + " : " + seconds_str;
  };

  useEffect(() => {
    setTimeout(fetchDate, 1000);
  }, []);

  useEffect(() => {
    setTimeout(fetchDate, 1000);
  }, [date]);



  return (
      <div className="nft-item">
        <div className="nft-name">
          {props["name"]}
        </div>
        <img className="nft-image" src={props["link"]}/>
        <div className="nft-bidder">
          Highest Bidder: {props["highest_bidder"]}
        </div>
        <div className="nft-bid">
          Highest Bid: {props["highest_bid"]}
        </div>
        <div className="nft-time-left">
          Time Left: {formatTimeLeft(props["date_end"] - date > 0? props["date_end"] - date: 0)}
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
          <button onClick={onBidPressed}>Bid</button>
        </div>
      </div>
  );    
}

const AuctionBoard = (props) => {
  const [auction_items, setAuctionItems] = useState([]);
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
    const fetchAuctionData = async() => {
      const { sucess, data } = await getAuctionOffers();
      const url = "https://gateway.pinata.cloud/ipfs/";
      let nft_auction_data = null;
      let token_data = null;
      let items = [];
      let time_left = 0;
      for(let i=0; i<data.length; i++){
        items.push({});
        nft_auction_data  = await getJSON(url+data[i]["ipfs_pin_hash"]);
        token_data = await getJSON(nft_auction_data["uri"]);
        items[i]["pin_hash"] = data[i]["ipfs_pin_hash"];
        items[i]["token_id"] = nft_auction_data["id"];
        items[i]["name"] = token_data["name"];
        items[i]["link"] = token_data["image_url"];
        items[i]["highest_bidder"] = await getAuctionHighestBidder(nft_auction_data["id"]);
        items[i]["highest_bid"] = await getAuctionHighestBid(nft_auction_data["id"]);
        time_left = await getAuctionTimeLeft(nft_auction_data["id"]);
        items[i]["date_end"] = parseInt(Math.abs(new Date())/1000) + parseInt(time_left);
      }
      setAuctionItems(items);
    }
    fetchAuctionData();
  }, []);
  
  useEffect(() => {
      const f = async() => {
        const { address, status } = await getCurrentWalletConnected();
        setWallet(address);
        setStatus(status);
      }
      f();
      addWalletListener();
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
                          date_end={item["date_end"]}
                          />
                })
              }
            </div>
        </div>
    );
}

export default AuctionBoard;