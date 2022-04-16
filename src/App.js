import './App.css';
import {useEffect, useState } from "react";
import Minter from './components/Minter'
import OwnedBoard from './components/Owned-Board';
import SellPublisher from './components/Sell-Publish';
import MarketPlace from './components/Sell-Board';
import AuctionBoard from './components/Auction-Board';
import AuctionCollector from './components/Auction-Collect';
import AuctionCreator  from './components/Auction-Publish';
import AuctionRenewer from './components/Auction-Renew';
import AuctionBidWithdrawer from './components/Auction-Withdraw-Bid';
import { clearPinata } from './util/pinata.js';
import { socket } from './components/sockets';
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'


const pinata = require("./util/pinata.js");

function App() {
  const [component, setComponent] = useState("main_menu");
  const components = {
    "minter": <Minter socket={socket}/>, "owned_board": <OwnedBoard/>, "sell_publisher": <SellPublisher socket={socket}/>,
    "auction_creator": <AuctionCreator />, "market_place": <MarketPlace socket={socket}/>,
    "auction_board": <AuctionBoard />, "auction_bid_withdrawer": <AuctionBidWithdrawer />,
    "auction_collector": <AuctionCollector />, "auction_renewer": <AuctionRenewer />};

    useEffect(() => {
      socket.on('connect', ()=>console.log(socket.id));
      socket.on('mined-tx', (body) => {
        body.insert = "top";
        body.container =  "top-right";
        body.animationIn = ["animate__animated", "animate__fadeIn"];
        body.animationOut = ["animate__animated", "animate__fadeOut"];
        body.dismiss = {
          duration: 5000,
          onScreen: true
        }
        Store.addNotification(body); 
        alert(JSON.stringify(body));       
      })
      return () => socket.disconnect();
    }, []);

  if(component === "main_menu"){
    return (
      <div className="main-menu-options-container">
        <ReactNotifications />
        <button onClick={() => setComponent("minter")}>Mint NFT</button>
        <button onClick={() => setComponent("owned_board")}>Watch your NFTs</button>
        <button onClick={() => setComponent("sell_publisher")}>Sell</button>
        <button onClick={() => setComponent("auction_creator")}>Create Auction</button>
        <button onClick={() => setComponent("market_place")}>Market Place</button>
        <button onClick={() => setComponent("auction_board")}>Auction Board</button>
        <button onClick={() => setComponent("auction_bid_withdrawer")}>Withdraw Auction Bid</button>
        <button onClick={() => setComponent("auction_collector")}>Collect Auction</button>
        <button onClick={() => setComponent("auction_renewer")}>Renew Auction</button>
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
