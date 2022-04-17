import './App.css';
import {useEffect, useState } from "react";
import { connectWallet } from './util/interact';
import Minter from './components/Minter'
import OwnedBoard from './components/Owned-Board';
import SellPublisher from './components/Sell-Publish';
import MarketPlace from './components/Sell-Board';
import AuctionBoard from './components/Auction-Board';
import AuctionCollector from './components/Auction-Collect';
import AuctionCreator  from './components/Auction-Publish';
import AuctionRenewer from './components/Auction-Renew';
import AuctionBidWithdrawer from './components/Auction-Withdraw-Bid';
import { socket } from './components/sockets';

const pinata = require("./util/pinata.js");

function App() {
  const [walletAddress, setWallet] = useState("");
  const [component, setComponent] = useState("main_menu");
  const components = {
    "minter": <Minter socket={socket}/>, "owned_board": <OwnedBoard/>, "sell_publisher": <SellPublisher socket={socket}/>,
    "auction_creator": <AuctionCreator socket={socket}/>, "market_place": <MarketPlace socket={socket}/>,
    "auction_board": <AuctionBoard socket={socket}/>, "auction_bid_withdrawer": <AuctionBidWithdrawer socket={socket}/>,
    "auction_collector": <AuctionCollector socket={socket}/>, "auction_renewer": <AuctionRenewer socket={socket}/>};

    function addWalletListener() {
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0) {
            setWallet(accounts[0]);
          } else {
            setWallet("");
            alert("Connect to Metamask");
          }
        });
      } else {
        alert(
              "You must install Metamask, a virtual Ethereum wallet, in your browser")
      }
    }

    const connectWalletPressed = async () => {
      const wallet = await connectWallet();
      setWallet(wallet);
    }; 

    useEffect(() => {
      socket.on('connect', ()=>{});
      socket.on('mined-tx', (message) => {
        alert(message)     
      })
      addWalletListener();
      return () => socket.disconnect();
    }, []);

  if(component === "main_menu"){
    return (
      <div>
        <h1>NFTS Udea</h1>
        <div className="main-menu-options-container">
        <br></br>
        <button onClick={connectWalletPressed}>
          {walletAddress.length > 0 ? (
            "Connected: " +
            String(walletAddress).substring(0, 6) +
            "..." +
            String(walletAddress).substring(38)
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
        <button onClick={() => setComponent("minter") } disabled={walletAddress===""}>Mint NFT</button>
        <button onClick={() => setComponent("owned_board")} disabled={walletAddress===""}>Watch your NFTs</button>
        <button onClick={() => setComponent("sell_publisher")} disabled={walletAddress===""}>Sell</button>
        <button onClick={() => setComponent("auction_creator")} disabled={walletAddress===""}>Create Auction</button>
        <button onClick={() => setComponent("market_place")} disabled={walletAddress===""}>Market Place</button>
        <button onClick={() => setComponent("auction_board")} disabled={walletAddress===""}>Auction Board</button>
        <button onClick={() => setComponent("auction_bid_withdrawer")} disabled={walletAddress===""}>Withdraw Auction Bid</button>
        <button onClick={() => setComponent("auction_collector")} disabled={walletAddress===""}>Collect Auction</button>
        <button onClick={() => setComponent("auction_renewer")} disabled={walletAddress===""}>Renew Auction</button>
      </div>
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
