import { useEffect, useState } from "react";
import './Board.css';

import {
    buyNFT
} from "../util/interact";

import {tokenSold} from "../util/validations";
import { getMarketOffers, getPinataJSON } from "../util/pinata";
import ReactPaginate from 'react-paginate';


const BoardCell = (props) => {
    const onBuyPressed = async() => {
      const {success, status, tx} = await buyNFT(props.name, props.token_price);
      alert(status);
      if(success){
        props.socket.emit('made_tx', tx);
      }
    };

    const onCheckOffer = async() => {
      const data = await getPinList('metadata[keyvalues][name]'+props.name,
       publish_storage_key, publish_storage_secret);
      if(data.length > 0){
        alert("Someone has already made an offer fot this NFT");
      }
    };

    const onCheckSold = async() => {
      const sold = await tokenSold(props.name);
      if(sold){
        alert("This NFT has already been sold");
      }
    };

    return (
        <div className="nft-item">
          <div className="nft-name">
            {props.name}
          </div>
          <img className="nft-image" src={props.image_url}/>
          <div className="nft_price">
            {props.price}
          </div>
          <button onClick={onCheckOffer}>Check Offer</button>
          <br></br>
          <button onClick={onCheckSold}>Check Sold</button>
          <br></br>
          <button onClick={onBuyPressed}>Buy</button>
        </div>
    );
}

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

function Items({ currentItems, socket }) {
  return (
    <>
      {
        currentItems && currentItems.map((item, index) =>{
          return <BoardCell
                  key={String(index)}
                  token_price={item.price}
                  name={item.name}
                  link={item.image_url}
                  price={item.price + " ETH"}
                  socket={socket}/>
        })
      }
    </>
  );
}

function PaginatedItems({ itemsPerPage, socket }) {

  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    const fetchSellData = async() => {
      const data = await getMarketOffers();
      let items = [];
      if(data.length > 0){
        let sell_data = null;
        for(let i=0; i<data.length; i++){
          items.push({});
          sell_data = await getPinataJSON(data[i].ipfs_pin_hash);
          items[i].pin_hash = data[i].ipfs_pin_hash;
          items[i].image_url = sell_data.image_url;
          items[i].name = sell_data.name;
          items[i].price = sell_data.price;
        }
      }
      setCurrentItems(items.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(items.length / itemsPerPage));
    }
    fetchSellData();
  }, [itemOffset, itemsPerPage]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  return (
    <>
    <div className="nft-item-container">
    <Items currentItems={currentItems} socket={socket}/>
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
              <PaginatedItems itemsPerPage={10} socket={props.socket}/>
        </div>
    );
}

export default MarketPlace;