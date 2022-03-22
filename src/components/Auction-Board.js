import { useEffect, useState } from "react";
import './Board.css';

import {
    getJSON, bidNFT
} from "../util/interact";

import {
  getAuctionHighestBid
} from "../util/contract-interactions";

import {
    getAuctionOffers,
  } from "../util/pinata";

var bigInt = require("big-integer");
const wei = bigInt(1000000000000000000);

const BoardCell = (props) => {
  const [date, setDate] = useState(0);
  const [bid, setBid] = useState(0);

  const fetchDate = () => {
    setDate(parseInt(Math.abs(new Date())/1000));
  };

  const onBidPressed = async() => {
    const {success, status} = await bidNFT(props["token_id"], bid);
    if(success){
      props.highest_bid = bid;
    }
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
        <div className="nft-bid">
          Highest Bid: {props["highest_bid"]}
        </div>
        <div className="nft-time-left">
          {formatTimeLeft(props["date_end"] - date > 0? props["date_end"] - date: 0)}
        </div>
        <form>
          <h2>Make Bid: </h2>
              <input className="nft-make-bid"
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

  const weiToETH = (n_wei) => {
    return parseFloat(bigInt(n_wei)) / parseFloat(wei);
  } 

  useEffect(() => {
    const fetchAuctionData = async() => {
      const { sucess, data } = await getAuctionOffers();
      const url = "https://gateway.pinata.cloud/ipfs/";
      let nft_auction_data = null;
      let items = [];
      for(let i=0; i<data.length; i++){
        items.push({});
        nft_auction_data = await getJSON(url+data[i].ipfs_pin_hash);
        items[i].pin_hash = data[i].ipfs_pin_hash;
        items[i].token_id = nft_auction_data.id;
        items[i].name = nft_auction_data.name;
        items[i].link = nft_auction_data.image;
        items[i].highest_bid = await getAuctionHighestBid(nft_auction_data.id);
        items[i].highest_bid = weiToETH(items[i].highest_bid);
        items[i].date_end = parseInt(Math.abs(new Date())/1000) + parseInt(nft_auction_data.time);
      }
      setAuctionItems(items);
    }
    fetchAuctionData();
  }, []);
  
    return (
      <div className="nft-item-container">
        {
          auction_items.map((item, index) =>{
            return <BoardCell
                    key={String(index)}
                    pin_hash={item.pin_hash}
                    token_id={item.token_id}
                    name={item.name}
                    link={item.link}
                    highest_bid={item.highest_bid + " ETH"}
                    date_end={item.date_end}
                    />
          })
        }
      </div>
  );
}

export default AuctionBoard;