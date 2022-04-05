import { useEffect, useState } from "react";
import './Board.css';


import {
    BuyNFTOnMarket,
    getJSON
} from "../util/interact";

import ReactPaginate from 'react-paginate';

const BoardCell = (props) => {
  /*

    const onBuyPressed = async() => {
      const {success, status} = await BuyNFTOnMarket(props.name, props.token_price);
      if(success){
        alert(status);
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
          <button onClick={onBuyPressed}>Buy</button>
        </div>
    );
    */
}

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

function Items({ currentItems }) {
  return (
    <>
      {
        currentItems && currentItems.map((item, index) =>{
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
    </>
  );
}

function PaginatedItems({ itemsPerPage }) {

  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    /*
    const endOffset = itemOffset + itemsPerPage;
    const fetchSellData = async() => {
      const { success, data } = await getMarketOffers();
      let items = [];
      if(success){
        const url = "https://gateway.pinata.cloud/ipfs/";
        let sell_data = null;
        for(let i=0; i<data.length; i++){
          items.push({});
          sell_data = await getJSON(url+data[i].ipfs_pin_hash);
          items[i].pin_hash = data[i].ipfs_pin_hash;
          items[i].link = sell_data.image;
          items[i].name = sell_data.name;
          items[i].price = sell_data.price;
          items[i].token_id = sell_data.id;
        }
      }
      setCurrentItems(items.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(items.length / itemsPerPage));
    }
    fetchSellData();
    */
  }, [itemOffset, itemsPerPage]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  return (
    <>
    <div className="nft-item-container">
    <Items currentItems={currentItems} />
    </div>
      <ReactPaginate
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        previousLabel="< previous"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakLabel="..."
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="pagination"
        activeClassName="active"
        renderOnZeroPageCount={null}
      />
    </>
  );
}

const MarketPlace = (props) => {
    return (
        <div>
              <PaginatedItems itemsPerPage={10} />
        </div>
    );
}

export default MarketPlace;