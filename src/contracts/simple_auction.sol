// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./minter.sol";
contract NFTAuction  is IERC721Receiver{


    string private ERR_AUCTION_GOING_ON = "The Auction has not ended";
    string private ERR_AUCTION_FINISHED = "The Auction has ended";
    string private ERR_NOT_ENOUGH = "The bid is not enough";
    string private ERR_SELLER_BIDDING = "Sellers cannot bid";
    string private ERR_HIGHEST_BIDDER_BIDDING = "Highest bidders cannot bid again";
    string private ERR_AUCTION_WON = "Someone have won the auction";
    string private ERR_CANNOT_COLLECT = "You are not the publisher nor the highest bidder of this NFT";
    string private ERR_HIGHEST_BIDDER_UNBIDDING = "Highest bidders can not withdraw their bid";
    string private ERR_NO_BID = "You did not bid for this NFT";
    
    struct AuctionData{
        address _seller;
        address _highest_bidder;
        uint256 _highest_bid;
        uint256 _active_time;
        bool _has_winner;
    }

    struct ReturnData{
        mapping (address => uint256) _pending_returns;
    }

    mapping (uint256 => AuctionData) private _auction_book;
    mapping (uint256 => mapping (address => uint256)) private _pending_returns;
    MarketMinter private _token_storage;
    AuctionData private _empty_auction = AuctionData(address(0), address(0), 0, 0, false);

    constructor(address token_storage)
        public
    {
        _token_storage = MarketMinter(token_storage);
    }

    /**
    * Always returns `IERC721Receiver.onERC721Received.selector`.
    */
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function publish(uint256 active_time, uint256 token_id)
        external
    {
        _token_storage.safeTransferFrom(msg.sender, address(this), token_id);
        _auction_book[token_id] = AuctionData(msg.sender, address(0), 0, block.timestamp + active_time, false);
    }

    function withdraw(uint256 token_id)
        public
    {
        AuctionData memory auction_data = _auction_book[token_id];
        require(block.timestamp <= auction_data._active_time, ERR_AUCTION_GOING_ON);
        _auction_book[token_id] = _empty_auction;
    }

    function renew(uint256 token_id, uint256 active_time)
        external
    {
        AuctionData memory auction_data = _auction_book[token_id];
        require(block.timestamp <= auction_data._active_time, ERR_AUCTION_GOING_ON);
        require(!auction_data._has_winner, ERR_AUCTION_WON);
        auction_data._active_time = block.timestamp + active_time;
        _auction_book[token_id] = auction_data;
    }

    function bid(uint256 token_id)
        external
        payable
    {
        AuctionData memory auction_data = _auction_book[token_id];
        address bidder = msg.sender;
        require(block.timestamp <= auction_data._active_time, ERR_AUCTION_FINISHED);
        require(bidder != auction_data._seller, ERR_SELLER_BIDDING);
        require(bidder != auction_data._highest_bidder, ERR_HIGHEST_BIDDER_BIDDING);
        uint256 pending_return = _pending_returns[token_id][bidder];
        if(pending_return == 0){
            require(msg.value > auction_data._highest_bid, ERR_NOT_ENOUGH);
            _pending_returns[token_id][auction_data._highest_bidder] = auction_data._highest_bid;
            auction_data._highest_bid = msg.value;
        }else{
            require(msg.value + pending_return > auction_data._highest_bid, ERR_NOT_ENOUGH);
            _pending_returns[token_id][bidder] = 0;
            auction_data._highest_bid = msg.value + pending_return;
        }
        auction_data._highest_bidder = bidder;
        auction_data._has_winner = true;
        _auction_book[token_id] = auction_data;
    }

    function collectedMoney(uint256 token_id)
        public
    {
        AuctionData memory auction_data = _auction_book[token_id];
        auction_data._seller = address(0);
        _auction_book[token_id] = auction_data;
    }

    function collectedNFT(uint256 token_id)
        public
    {
        AuctionData memory auction_data = _auction_book[token_id];
        auction_data._highest_bidder = address(0);
        _auction_book[token_id] = auction_data;       
    }

    function collectAuction(uint256 token_id)
        external
    {
        require(msg.sender == getAuctionSeller(token_id) || 
        msg.sender == getHighestBidder(token_id), ERR_CANNOT_COLLECT);
        uint256 highest_bid = getHighestBid(token_id);
        if(msg.sender == getAuctionSeller(token_id)){
            if(highest_bid > 0){
                address payable seller = payable(msg.sender);
                seller.transfer(getHighestBid(token_id));
                collectedMoney(token_id);
            }else{
                _token_storage.safeTransferFrom(address(this), msg.sender, token_id);
                withdraw(token_id);
            }
        }else{
            _token_storage.safeTransferFrom(address(this), msg.sender, token_id);
            collectedNFT(token_id);
        }
    }


    function withdrawBid(uint256 token_id)
        external
    {
        require(msg.sender != getHighestBidder(token_id), ERR_HIGHEST_BIDDER_UNBIDDING);
        uint256 return_bid = getReturn(token_id, msg.sender);
        require(return_bid > 0, ERR_NO_BID);
        address payable bidder = payable(msg.sender);
        bidder.transfer(return_bid);
    }

    function getAuctionSeller(uint256 token_id)
        public
        view
        returns(address)
    {
        return _auction_book[token_id]._seller;
    }

    function getHighestBidder(uint256 token_id)
        public 
        view
        returns(address)
    {
        return _auction_book[token_id]._highest_bidder;
    }

    function getHighestBid(uint256 token_id)
        public
        view
        returns(uint256)
    {
        return _auction_book[token_id]._highest_bid;
    }

    function getReturn(uint256 token_id, address bidder)
        public
        returns(uint256)
    {
        uint256 value = _pending_returns[token_id][bidder];
        _pending_returns[token_id][bidder] = 0;
        return value;
    }
}