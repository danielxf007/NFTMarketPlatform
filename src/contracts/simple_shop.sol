// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./minter.sol";

contract NFTShop is IERC721Receiver{

    string private ERR_NOT_ENOUGH = "You do not have enough ether"; 
    string private ERR_ALREADY_SOLD = "This NFT was already sold";
    struct Item{
        address _seller;
        uint256 _price;
        bool _sold;
    }

    MarketMinter private _token_storage;
    mapping (uint256 => Item) private _book;

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

    function publishSell(uint256 price, uint256 token_id)
        external
    {
        _token_storage.safeTransferFrom(msg.sender, address(this), token_id);
        _book[token_id] = Item(msg.sender, price, false);
    }

    function buy(uint256 token_id)
        payable
        external
    {
        Item memory item = _book[token_id];
        require(msg.value == item._price, ERR_NOT_ENOUGH);
        require(!item._sold, ERR_ALREADY_SOLD);
        address payable seller = payable(item._seller);
        seller.transfer(msg.value);
       _token_storage.safeTransferFrom(address(this), msg.sender, token_id);
        item._sold = true;
        _book[token_id] = item;
    }

    function remove(uint256 token_id)
        external
    {
        _book[token_id] = Item(address(0), 0, false);
    }

}