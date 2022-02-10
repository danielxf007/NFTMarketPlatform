import './App.css';
import { useEffect, useState } from "react";
import Minter from './Minter'
import Main_menu from './Main-menu';
import Auction_creator from './Auction-creation';
import MarketPlace from './Market-Place';
//<Minter></Minter>
function App() {
  const [component, setComponent] = useState("main_menu");
  const components = {"main_menu": <Main_menu/>, "minter": <Minter/>,
   "auction_creator": <Auction_creator/>, "market_place": <MarketPlace/>};

  switch(component){
    case "main_menu":
      return (
        <div>
          <button onClick={() => setComponent("minter")}>Mint NFT</button>
          <button onClick={() => setComponent("auction_creator")}>Create Auction</button>
          <button onClick={() => setComponent("market_place")}>Market Place</button>
          {components[components]}
        </div>
      );
    case "minter":
      return (
          <div>
            {components[component]}
            <button onClick={() => setComponent("main_menu")}>Back</button>
          </div>
      );
    case "auction_creator":
        return (
            <div>
              {components[component]}
              <button onClick={() => setComponent("main_menu")}>Back</button>
            </div>
        );
    case "market_place":
          return (
            <div>
              {components[component]}
              <button onClick={() => setComponent("main_menu")}>Back</button>
            </div>            
          );
  }
};

export default App;
