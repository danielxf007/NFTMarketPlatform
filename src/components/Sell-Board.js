import { useEffect, useState } from "react";
import './Board.css';


import {
    BuyNFTOnMarket,
    getJSON
} from "../util/interact";

import {
  getMarketOffers,
  removePinFromIPFS
} from "../util/pinata";


const BoardCell = (props) => {
  const [status, setStatus] = useState("");

    const onBuyPressed = async() => {
      const {success, status} = await BuyNFTOnMarket(props.token_id, props.token_price);
      setStatus(status);
      if(success){
        const unpin_response = await removePinFromIPFS(props.pin_hash);
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
          <br></br>
          <p id="status" style={{ color: "red" }}>
                {status}
          </p>
        </div>
    );
}

const MarketPlace = (props) => {
    const [sell_items, setSellItems] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);

  useEffect(() => {
      const fetchSellData = async() => {
        const { sucess, data } = await getMarketOffers();
        if(!sucess)
          setSellItems([]);
        const url = "https://gateway.pinata.cloud/ipfs/";
        let sell_data = null;
        let items = []
        for(let i=0; i<data.length; i++){
          items.push({});
          sell_data = await getJSON(url+data[i].ipfs_pin_hash);
          items[i].pin_hash = data[i].ipfs_pin_hash;
          items[i].link = sell_data.image;
          items[i].name = sell_data.name;
          items[i].price = sell_data.price;
          items[i].token_id = sell_data.id;
        }
        setSellItems(items);
      }
      fetchSellData();
    }, []);

    return (
        <div>
            <div className="nft-item-container">
              {
                sell_items.map((item, index) =>{
                  return <BoardCell
                          key={String(index)}
                          pin_hash={item.pin_hash}
                          token_id={item.token_id}
                          token_price={item.price}
                          name={item.name}
                          link={item.link}
                          price={item.price + " ETH"}/>
                })
              }
            </div>
        </div>
    );
}

export default MarketPlace;