import { useEffect, useState } from "react";
import './Board.css';

import {
    buyNFT,
    getPublishedSells
} from "../util/interact";

import ReactPaginate from 'react-paginate';
var bigInt = require("big-integer");
const wei = bigInt(1000000000000000000);

const BoardCell = (props) => {

    const onBuyPressed = async() => {
      const {success, status, tx} = await buyNFT(props.name, props.price);
      alert(status);
      if(success){
        props.socket.emit('made_tx', tx);
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
          <br></br>
          <button onClick={onBuyPressed}>Buy</button>
        </div>
    );
}

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

function Items({ currentItems, socket }) {
  const name = 0;
  const image_url = 1;
  const price = 2;

  return (
    <>
      {
        currentItems && currentItems.map((item, index) =>{
          return <BoardCell
                  key={String(index)}
                  name = {item[name]}
                  image_url = {item[image_url]}
                  price = {(bigInt(item[price])/wei).toString() + " ETH"}
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
      const items = await getPublishedSells();
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