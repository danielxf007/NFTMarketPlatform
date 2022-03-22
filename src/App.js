import './App.css';
import { useEffect, useState } from "react";
import Minter from './components/Minter'
import SellPublisher from './components/Sell-Publish';
import MarketPlace from './components/Sell-Board';
import AuctionBoard from './components/Auction-Board';
import AuctionCollector from './components/Auction-Collect';
import AuctionCreator  from './components/Auction-Publish';
import AuctionRenewer from './components/Auction-Renew';
import AuctionBidWithdrawer from './components/Auction-Withdraw-Bid';
import {
  clearPinata
} from "./util/pinata";



function App() {
  const [component, setComponent] = useState("main_menu");
  const components = {
    "minter": <Minter/>, "sell_publisher": <SellPublisher/>,
    "auction_creator": <AuctionCreator/>, "market_place": <MarketPlace/>,
    "auction_board": <AuctionBoard/>, "auction_bid_withdrawer": <AuctionBidWithdrawer />,
    "auction_collector": <AuctionCollector />, "auction_renewer": <AuctionRenewer />};
  

  if(component === "main_menu"){
    return (
      <div className="main-menu-options-container">
        <button onClick={() => setComponent("minter")}>Mint NFT</button>
        <button onClick={() => setComponent("sell_publisher")}>Sell</button>
        <button onClick={() => setComponent("auction_creator")}>Create Auction</button>
        <button onClick={() => setComponent("market_place")}>Market Place</button>
        <button onClick={() => setComponent("auction_board")}>Auction Board</button>
        <button onClick={() => setComponent("auction_bid_withdrawer")}>Withdraw Auction Bid</button>
        <button onClick={() => setComponent("auction_collector")}>Collect Auction</button>
        <button onClick={() => setComponent("auction_renwer")}>Renew Auction</button>
        <button onClick={clearPinata}>clearPinata</button>
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