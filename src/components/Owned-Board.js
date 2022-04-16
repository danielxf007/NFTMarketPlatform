import { useEffect, useState } from "react";
import './Board.css';
import { getTokens, checkNFTStatus } from "../util/interact";
import ReactPaginate from 'react-paginate';


const BoardCell = (props) => {

  const onCheckStatusPressed = async() => {
    const status = await checkNFTStatus(props.name);
    alert(status)
  }

  return (
      <div className="nft-item">
        <div className="nft-name">
          {props.name}
        </div>
        <img className="nft-image" src={props.image_url}/>
        <br></br>
        <button onClick={onCheckStatusPressed}>Check Status</button>          
      </div>
  );
}

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

function Items({ currentItems }) {
  const name = 0;
  const image_url = 1;
  return (
    <>
      {
        currentItems && currentItems.map((item, index) =>{
          return <BoardCell
                  key={String(index)}
                  name={item[name]}
                  image_url={item[image_url]}
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
    const getNFTs= async() => {
      const items = await getTokens();
      setCurrentItems(items.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(items.length / itemsPerPage));
    }
    getNFTs();
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

const OwnedBoard = (props) => {
    return (
        <div>
              <PaginatedItems itemsPerPage={10}/>
        </div>
    );
}

export default OwnedBoard;