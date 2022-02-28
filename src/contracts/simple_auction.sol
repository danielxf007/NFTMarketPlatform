// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleAuction{

    string ERR_AUCTION_GOING_ON = "The Auction has not ended";
    string ERR_AUCTION_FINISHED = "The Auction has ended";
    string ERR_NOT_ENOUGH = "The bid is not enough";
    string ERR_SELLER_BIDDING = "Sellers cannot bid their own NFTs";
    string ERR_HIGHEST_BIDDER_BIDDING = "Highest bidders cannot bid";
    
    struct AuctionData{
        address _seller;
        address _highest_bidder;
        uint256 _highest_bid;
        uint256 _active_time;
    }

    struct ReturnData{
        mapping (address => uint256) _pending_returns;
    }

    mapping (uint256 => AuctionData) private _auction_book;
    mapping (uint256 => mapping (address => uint256)) private _pending_returns;


    constructor(){

    }

    function createAuction(address seller, uint256 active_time, uint256 token_id)
        public
    {
        _auction_book[token_id] = AuctionData(seller, address(0), 0, block.timestamp + active_time);
    }

    function withdrawAuction(uint256 token_id)
        public
    {
        AuctionData memory auction_data = _auction_book[token_id];
        require(block.timestamp < auction_data._active_time, ERR_AUCTION_GOING_ON);
        _auction_book[token_id]._seller = address(0);
    }

    function bid(address bidder, uint256 amount, uint256 token_id)
        public
        returns(uint256)
    {
        AuctionData memory auction_data = _auction_book[token_id];
        require(block.timestamp <= auction_data._active_time, ERR_AUCTION_FINISHED);
        require(bidder != auction_data._seller, ERR_SELLER_BIDDING);
        require(bidder != auction_data._highest_bidder, ERR_HIGHEST_BIDDER_BIDDING);
        uint256 pending_return = _pending_returns[token_id][bidder];
        if(pending_return == 0){
            require(amount > auction_data._highest_bid, ERR_NOT_ENOUGH);
            _pending_returns[token_id][auction_data._highest_bidder] = auction_data._highest_bid;
            auction_data._highest_bidder = bidder;
            auction_data._highest_bid = amount;
            _auction_book[token_id] = auction_data;
            return amount;
        }
        require(amount + pending_return > auction_data._highest_bid, ERR_NOT_ENOUGH);
        _pending_returns[token_id][auction_data._highest_bidder] = auction_data._highest_bid;
        auction_data._highest_bidder = bidder;
        auction_data._highest_bid = amount + pending_return;
        _pending_returns[token_id][bidder] = 0;
        _auction_book[token_id] = auction_data;
        return auction_data._highest_bid;
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
        uint256 amount = _pending_returns[token_id][bidder];
        _pending_returns[token_id][bidder] = 0;
        return amount;
    }

    function getTimeLeft(uint256 token_id)
        public
        view
        returns(uint256)
    {
        AuctionData memory auction_data = _auction_book[token_id];
        uint256 time_left = 0;
        if(block.timestamp < auction_data._active_time)
            time_left = auction_data._active_time - block.timestamp;
        return time_left;
    }

    function getAuctionData(uint256 token_id)
        public
        view
        returns(AuctionData memory)
    {
        AuctionData memory auction_data = _auction_book[token_id];
        return auction_data;
    }
}