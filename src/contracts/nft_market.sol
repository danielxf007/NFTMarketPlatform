// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./simple_shop.sol";
import "./simple_auction.sol";

contract NFTMarket is ERC721URIStorage, IERC721Receiver{
    string private ERR_NOT_OWNER = "You are not the owner of this NFT";
    string private ERR_NOT_PUBLISHER = "You are not the publisher of this NFT";
    string private ERR_NOT_HIGHEST_BIDDER = "You are not the highest bidder";
    string private ERR_HIGHEST_BIDDER = "Highest bidders can not withdraw their offer";
    string private ERR_NO_BIDS = "You have no bids for this NFT";

    using Counters for Counters.Counter;
    Counters.Counter private _token_ids;
    SimpleNFTShop private simple_shop;
    SimpleAuction private simple_nft_auction;
    address payable _bank;

    struct MarketData{
        address payable token_owner;
        uint256 price;
        bool active;
    }

    mapping (uint256 => MarketData) public market;

    constructor() public ERC721("NFTMarket", "MarketNFT") {
        simple_shop = new SimpleNFTShop();
        simple_nft_auction = new SimpleAuction();
        _bank = payable(address(this));
    }

    /**
    * Always returns `IERC721Receiver.onERC721Received.selector`.
    */
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function mintNFT(address recipient, string memory tokenURI, uint256 n_copies)
        external
    {
        uint256 item_id;
        for(uint256 i = 0; i < n_copies; i++){
            item_id = _token_ids.current();
            _mint(recipient, item_id);
            _setTokenURI(item_id, tokenURI);
            _token_ids.increment();
        }
    }

    function publishSell(uint256 price, uint256 token_id)
        external
    {
        require(_isApprovedOrOwner(msg.sender, token_id), "The seller is not the token's owner");
        safeTransferFrom(msg.sender, address(this), token_id);
        simple_shop.add(payable(msg.sender), price, token_id);
    }

    function publishAuction(uint256 active_time, uint256 token_id)
        external    
    {
        require(_isApprovedOrOwner(msg.sender, token_id), ERR_NOT_OWNER);
        safeTransferFrom(msg.sender, address(this), token_id);
        simple_nft_auction.createAuction(msg.sender, active_time, token_id);
    }

    function buyNFT(uint256 token_id)
        payable
        external
    {
        require(simple_shop.isBeingSold(token_id), "Inactive on Market");
        require(msg.value == simple_shop.priceOf(token_id), "Not enough money");
        address payable seller = simple_shop.sellerOf(token_id);
        seller.transfer(msg.value);
        this.safeTransferFrom(address(this), msg.sender, token_id);
        simple_shop.remove(token_id);
    }

    function bidNFT(uint256 token_id)
        payable
        external
    {
        simple_nft_auction.bid(msg.sender, msg.value, token_id);
    }

    function collectAuction(uint256 token_id)
        external
    {
        require(msg.sender == simple_nft_auction.getAuctionSeller(token_id), ERR_NOT_PUBLISHER);
        uint256 highest_bid = simple_nft_auction.getHighestBid(token_id);
        if(highest_bid > 0){
            _bank.transfer(highest_bid);
            
        }else{
            this.safeTransferFrom(address(this), msg.sender, token_id);
        }
        simple_nft_auction.withdrawAuction(token_id);
    }

    function collectNFT(uint256 token_id)
        external
    {
        require(msg.sender == simple_nft_auction.getHighestBidder(token_id), ERR_NOT_HIGHEST_BIDDER);
        this.safeTransferFrom(address(this), msg.sender, token_id);
    }

    function getAuctionReturn(uint256 token_id)
        external
    {
        require(msg.sender != simple_nft_auction.getHighestBidder(token_id), ERR_HIGHEST_BIDDER);
        uint256 bid = simple_nft_auction.getReturn(token_id, msg.sender);
        require(bid > 0, ERR_NO_BIDS);
        address payable bidder = payable(msg.sender);
        bidder.transfer(bid);
    }

    function getAuctionTimeLeft(uint256 token_id)
        public
        view
        returns(uint256)
    {
        return simple_nft_auction.getTimeLeft(token_id);
    }

    function getAuctionHighestBidder(uint256 token_id)
        public
        view
        returns(address)
    {
        return simple_nft_auction.getHighestBidder(token_id);
    }

    function getAuctionHighestBid(uint256 token_id)
        public
        view
        returns(uint256)
    {
        return simple_nft_auction.getHighestBid(token_id);
    }

}