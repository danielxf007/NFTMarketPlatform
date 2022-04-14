// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./nft_storage.sol";
contract NFTAuction  is IERC721Receiver{

    string private ERR_NO_TOKEN = "This token does not exist";
    string private ERR_CANNOT_TRADE = "You cannot trade this token";
    string private ERR_ALREADY_PUBLISHED = "This token is already published";
    string private ERR_NOT_PUBLISHED = "There is no auction for this token";
    string private ERR_NOT_PUBLISHER = "You are not the seller of this token";
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
        string _name;
        string _image_url;
        string _end_date;
        address _seller;
        address _highest_bidder;
        uint256 _highest_bid;
        uint256 _active_time;
        bool _active;
    }

    mapping (string => bool) private _publish_history;
    mapping (string => bool) private _auction_winner;
    mapping (string => mapping (address => uint256)) private _pending_returns;
    mapping (string => uint256) private _arr_indexing;
    mapping (string => bool) private _collected_by_seller;
    mapping (string => bool) private _collected_by_highest_bidder;

    TokenStorage private _token_storage;
    AuctionData[] private _auctions;

    constructor(address token_storage)
        public
    {
        _token_storage = TokenStorage(token_storage);
        _auctions.push(AuctionData("", "", "", address(0), address(0), 0, 0, false));
    }

    /**
    * Always returns `IERC721Receiver.onERC721Received.selector`.
    */
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /*
    *@dev checks if the token has already been published
    */    
    function published(string memory token_name)
        public
        view
        returns (bool)
    {
        return _publish_history[token_name];
    }

    /*
    *@dev allows a user to publish an auction for his token
    */    
    function publish(string memory token_name, string memory end_date, uint256 active_time)
        external
    {
        require(_token_storage.exists(token_name), ERR_NO_TOKEN);
        require(_token_storage.canTrade(token_name, msg.sender), ERR_CANNOT_TRADE);
        require(!published(token_name), ERR_ALREADY_PUBLISHED);
        uint256 token_id = _token_storage.getTokenId(token_name);
        _token_storage.safeTransferFrom(msg.sender, address(this), token_id);
        _auctions.push(AuctionData(token_name, _token_storage.tokenURI(token_id), end_date,
         msg.sender, address(0), 0, block.timestamp + active_time, true));
        _arr_indexing[token_name] = _auctions.length-1;
        _publish_history[token_name] = true;
        _auction_winner[token_name] = false;
        _collected_by_seller[token_name] = false;
        _collected_by_highest_bidder[token_name] = false;
    }

    function getAuctions()
        public
        view
        returns(AuctionData[] memory)
    {
        return _auctions;

    }

    function auctionFinished(string memory token_name)
        public
        view
        returns(bool)
    {
        return block.timestamp >= _auctions[_arr_indexing[token_name]]._active_time;
    }

    function getAuctionSeller(string memory token_name)
        public
        view
        returns(address)
    {
        return _auctions[_arr_indexing[token_name]]._seller;
    }

    function isAuctionSeller(string memory token_name, address user)
        public
        view
        returns(bool)
    {
        return getAuctionSeller(token_name) == user;
    }

    function getHighestBidder(string memory token_name)
        public 
        view
        returns(address)
    {
        return _auctions[_arr_indexing[token_name]]._highest_bidder;
    }

    function isHighestBidder(string memory token_name, address user)
        public
        view
        returns(bool)        
    {
        return getHighestBidder(token_name) == user;
    }

    function getHighestBid(string memory token_name)
        public
        view
        returns(uint256)
    {
        return _auctions[_arr_indexing[token_name]]._highest_bid;
    }

    function isBidEnough(string memory token_name, address bidder, uint256 bid_offer)
        public
        view
        returns(bool)
    {
        uint256 pending_return = _pending_returns[token_name][bidder];
        if(pending_return == 0){
            return bid_offer > getHighestBid(token_name);
        }
        return bid_offer + pending_return > getHighestBid(token_name);
    }

    function addToPendingReturns(string memory token_name, address bidder, uint256 bid_offer)
        private
    {
        _pending_returns[token_name][bidder] = bid_offer;
    }

    function removePendingReturn(string memory token_name, address bidder)
        private
        returns(uint256)
    {
        uint256 _return = _pending_returns[token_name][bidder];
        _pending_returns[token_name][bidder] = 0;
        return _return;
    }    

    function bid(string memory token_name)
        external
        payable
    {
        address bidder = msg.sender;
        require(published(token_name), ERR_NOT_PUBLISHED);
        require(!auctionFinished(token_name), ERR_AUCTION_FINISHED);
        require(!isAuctionSeller(token_name, bidder), ERR_SELLER_BIDDING);
        require(!isHighestBidder(token_name, bidder), ERR_HIGHEST_BIDDER_BIDDING);
        require(isBidEnough(token_name, bidder, msg.value), ERR_NOT_ENOUGH);
        addToPendingReturns(token_name, getHighestBidder(token_name), getHighestBid(token_name));
        AuctionData memory auction_data = _auctions[_arr_indexing[token_name]];
        uint256 pending_return = _pending_returns[token_name][bidder];
        if(pending_return == 0){
            auction_data._highest_bid = msg.value;
        }else{
            auction_data._highest_bid = msg.value + removePendingReturn(token_name, bidder);
        }
        auction_data._highest_bidder = bidder;
        _auctions[_arr_indexing[token_name]] = auction_data;
        _auction_winner[token_name] = true;
    }

    function hasWinner(string memory token_name)
        public
        view
        returns(bool)
    {
        return _auction_winner[token_name];
    }

    function renew(string memory token_name, string memory end_date, uint256 active_time)
        external
    {
        require(_token_storage.exists(token_name), ERR_NO_TOKEN);
        require(isAuctionSeller(token_name, msg.sender), ERR_NOT_PUBLISHER);
        require(published(token_name), ERR_NOT_PUBLISHED);
        require(auctionFinished(token_name), ERR_AUCTION_GOING_ON);
        require(!_auction_winner[token_name], ERR_AUCTION_WON);
        AuctionData memory auction_data = _auctions[_arr_indexing[token_name]];
        auction_data._end_date = end_date;
        auction_data._active_time = block.timestamp + active_time;
        _auctions[_arr_indexing[token_name]] = auction_data;
    }

    /*
    *@dev removes an item from the auctions
    */        
    function removeAuction(string memory token_name)
        private
    {
        uint256 index = _arr_indexing[token_name];
        uint256 last_index = _auctions.length-1;
        if(index != last_index){
            _auctions[index] = _auctions[last_index];
            _arr_indexing[_auctions[index]._name] = index;
        }
        _auctions.pop();
        _arr_indexing[token_name] = 0;
        _publish_history[token_name] = false;
    }

    function collectAuction(string memory token_name)
        external
    {
        require(published(token_name), ERR_NOT_PUBLISHED);
        require(auctionFinished(token_name), ERR_AUCTION_GOING_ON);
        require(isAuctionSeller(token_name, msg.sender) || 
        isHighestBidder(token_name, msg.sender), ERR_CANNOT_COLLECT);
        uint256 token_id = _token_storage.getTokenId(token_name);
        uint256 highest_bid = getHighestBid(token_name);
        AuctionData memory auction_data = _auctions[_arr_indexing[token_name]];
        if(msg.sender == getAuctionSeller(token_name)){
            if(highest_bid > 0){
                address payable seller = payable(msg.sender);
                seller.transfer(getHighestBid(token_name));
                _collected_by_seller[token_name] = true;
                auction_data._active = false;
            }else{
                _token_storage.safeTransferFrom(address(this), msg.sender, token_id);
                removeAuction(token_name);
            }
        }else{
            _token_storage.safeTransferFrom(address(this), msg.sender, token_id);
            _collected_by_highest_bidder[token_name] = true;
            auction_data._active = false;
        }
        _auctions[_arr_indexing[token_name]] = auction_data;
        if(_collected_by_seller[token_name] && _collected_by_highest_bidder[token_name]){
            removeAuction(token_name);
        }
    }

    function hasBidded(string memory token_name, address bidder)
        public
        view
        returns(bool)       
    {
        return getHighestBidder(token_name) == bidder || _pending_returns[token_name][bidder] > 0;
    }

    function withdrawBid(string memory token_name)
        external
    {
        require(hasBidded(token_name, msg.sender), ERR_NO_BID);
        require(!isHighestBidder(token_name, msg.sender), ERR_HIGHEST_BIDDER_UNBIDDING);
        uint256 return_bid = removePendingReturn(token_name, msg.sender);
        address payable bidder = payable(msg.sender);
        bidder.transfer(return_bid);
    }

}