import './App.css';
import { useEffect, useState } from "react";
import Minter from './Minter'
import Main_menu from './Main-menu';
import Auction_creator from './Auction-creation';
import MarketPlace from './components/Market-Place';
import AuctionCreator  from './components/Auction';
import AuctionBoard from './components/Auction-Board';
import {getJSON, getTokenUri} from './util/interact';
var bigInt = require("big-integer");
function App() {
  const [component, setComponent] = useState("main_menu");
  const components = {"main_menu": <Main_menu/>, "minter": <Minter/>,
   "sell_creator": <Auction_creator/>, "auction_creator": <AuctionCreator/>, "market_place": <MarketPlace/>,
    "auction_board": <AuctionBoard/>};

  const f = async() => {
    console.log("here");
    let data = await getJSON("https://gateway.pinata.cloud/ipfs/QmQyUiaz5sTRdpYkJ8ZywSgLZTLyyMMYoGGTY58JfbCg73");
    console.log(data)
    data = await getTokenUri(0);
    console.log(data);
    console.log(bigInt(1000000000000000000000000000000000000).toString(16));
  };

  if(component === "main_menu"){
    return (
      <div>
        <button onClick={() => setComponent("minter")}>Mint NFT</button>
        <button onClick={() => setComponent("sell_creator")}>Sell</button>
        <button onClick={() => setComponent("auction_creator")}>Create Auction</button>
        <button onClick={() => setComponent("market_place")}>Market Place</button>
        <button onClick={() => setComponent("auction_board")}>Auction Board</button>
        <button onClick={f}>Fetch</button>
        {components[components]}
      </div>
    );    
  }else{
    return (
      <div>
        {components[component]}
        <button onClick={() => setComponent("main_menu")}>Back</button>
      </div>
    );    
  }
};

export default App;
