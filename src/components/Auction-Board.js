import { useEffect, useState } from "react";
import './Board.css';

import {
    getActiveAuctions, getAuctionHighestBid
} from "../util/interact";

import {
  getAuctionHighestBid
} from "../util/contract-interactions";


import ReactPaginate from 'react-paginate';


var bigInt = require("big-integer");
const wei = bigInt(1000000000000000000);
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const BoardCell = (props) => {

  const [date, setDate] = useState(0);
  const [highest_bid, setHighestBid] = useState(0);
  const [bid, setBid] = useState(0);

  const weiToETH = (n_wei) => {
    return parseFloat(bigInt(n_wei)) / parseFloat(wei);
  }

  const fetchDate = () => {
    setDate(parseInt(Math.abs(new Date(props.end_date) - new Date())/1000));
  };

  const onBidPressed = async() => {
    const {success, status, tx} = await bidNFT(props.name, bid);
    alert(status);
    if(success){
      props.socket.emit('made_tx', tx);
      setHighestBid(bid);
    }
  };

  const formatTimeLeft = (secs) => {
    let hours = Math.floor(secs / (60 * 60));
    let hours_str = hours < 10? "0"+hours.toString(): hours.toString();

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);
    let minutes_str = minutes < 10? "0"+minutes.toString(): minutes.toString();

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);
    let seconds_str = seconds < 10? "0"+seconds.toString(): seconds.toString();

    return hours_str + " : " + minutes_str + " : " + seconds_str;
  };

  useEffect(() => {
    const update = async() => {
      const _highest_bid = await getAuctionHighestBid(props.name);
      setHighestBid(_highest_bid);
    }
    update();
    setTimeout(fetchDate, 1000);
  }, []);

  useEffect(() => {
    setTimeout(fetchDate, 1000);
  }, [date]);

  useEffect(() => {
  }, [highest_bid]);

  return (
      <div className="nft-item">
        <div className="nft-name">
          {props.name}
        </div>
        <img className="nft-image" src={props.image_url}/>
        <div className="nft-bid">
          Highest Bid: {weiToETH(item[highest_bid]).toString() + " ETH"}
        </div>
        <div className="nft-time-left">
          {formatTimeLeft(date)}
        </div>
        <form>
          <h2>Make Bid: </h2>
              <input className="nft-make-bid"
              type="number"
              placeholder="0"
              onChange={(event) => setBid(event.target.value)}
              />
          </form>
        <div>
          <button onClick={onBidPressed}>Bid</button>
        </div>
      </div>
  );    
}

function Items({ currentItems }) {
  const name = 0;
  const image_url = 1;
  const end_date = 2;

  return (
    <>
      {
        currentItems && currentItems.map((item, index) =>{
          return <BoardCell
                    key={String(index)}
                    name={item[name]}
                    image_url={item[image_url]}
                    end_date={item[end_date]}
                  />
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
    const endOffset = itemOffset + itemsPerPage;
    const fetchAuctionData = async() => {
      const items = await getActiveAuctions();
      setCurrentItems(items.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(items.length / itemsPerPage));
    }
    fetchAuctionData();
    
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

const AuctionBoard = (props) => {
    return (
      <div>
        <PaginatedItems itemsPerPage={10} />
      </div>
  );
}

export default AuctionBoard;