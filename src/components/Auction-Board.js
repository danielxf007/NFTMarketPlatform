import { useEffect, useState } from "react";
import './Board.css';

import {
    getJSON, getTimeLeft
} from "../util/interact";

import {
    getAuctionOffers,
    removePinFromIPFS
  } from "../util/pinata";

const BoardCell = (props) => {
    useEffect(() => {

    }, []);

    const onBuyPressed = async() => {
    };

    return (
        <div className="nft-item">
          <div className="nft-name">
            {props.name}
          </div>
          <img className="nft-image" src={props.link}/>
          <div className="nft-bid">
            Minimun Bid: {props["minimun_bid"]}
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
            />
            </form>
          <div>
            <button onClick={onBuyPressed}>Buy</button>
          </div>
        </div>
    );    
}

const AuctionBoard = (props) => {
    const [auction_items, setAuctionItems] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
    useEffect(() => {
        const f = async() => {
          const { sucess, data } = await getAuctionOffers();
          const url = "https://gateway.pinata.cloud/ipfs/";
          let auction_data = null;
          let token_data = null;
          let items = []
          let time_left;
          for(let i=0; i<data.length; i++){
            items.push({});
            auction_data = await getJSON(url+data[i]["ipfs_pin_hash"]);
            token_data = await getJSON(auction_data["uri"]);
            time_left = await getTimeLeft(auction_data["id"]);
            items[i]["pin_hash"] = data[i]["ipfs_pin_hash"];
            items[i]["link"] = token_data["image_url"];
            items[i]["name"] = token_data["name"];
            items[i]["minimun_bid"] = auction_data["minimun_bid"];
            items[i]["highest_bidder"] = auction_data["highest_bidder"];
            items[i]["highest_bid"] = auction_data["highest_bid"];
            items[i]["token_id"] = auction_data["id"];
            items[i]["time_left"] = String(time_left);
          }
          setAuctionItems(items);
        }
        f();
      }, []);

      return (
            <div className="nft-item-container">
              {
                auction_items.map((item, index) =>{
                  return <BoardCell
                          key={String(index)}
                          pin_hash={item["pin_hash"]}
                          token_id={item["token_id"]}
                          name={item["name"]}
                          link={item["link"]}
                          minimun_bid={item["minimun_bid"] + " WEI"}
                          highest_bidder={item["highest_bidder"]}
                          highest_bid={item["highest_bid"] + " WEI"}
                          price={item["price"] + " WEI"}
                          time_left={item["time_left"]}
                          />
                })
              }
            </div>
    );
}

export default AuctionBoard;