// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./nft_storage.sol";

contract NFTShop is IERC721Receiver{

    string private ERR_NO_TOKEN = "This token does not exist";
    string private ERR_CANNOT_TRADE = "You cannot trade this token";
    string private ERR_ALREADY_PUBLISHED = "This token is already been sold";
    string private ERR_NOT_PUBLISHED = "This token is not been sold";
    string private ERR_NOT_ENOUGH = "You do not have enough ether";
    string private ERR_ALREADY_SOLD = "This token was already sold";

    struct Item{
        string _name;
        string _image_url;
        uint256 _price;
        address _seller;
    }

    TokenStorage private _token_storage;
    mapping (string => bool) private _sold_history;
    mapping (string => bool) private _publish_history;
    mapping (string => uint256) private _arr_indexing;
    Item[] private _inventory;

    constructor(address token_storage)
        public
    {
        _token_storage = TokenStorage(token_storage);
        _inventory.push(Item("", "", 0,  address(0)));
        _arr_indexing[""] = 0;
    }

    /**
    *@dev this interface allows this contract to get tokens transfered to it
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
    *@dev allows a user to pulish an offert for their tokens
    */ 
    function publishSell(string memory token_name, uint256 price)
        external
    {
        require(_token_storage.exists(token_name), ERR_NO_TOKEN);
        require(_token_storage.canTrade(token_name, msg.sender), ERR_CANNOT_TRADE);
        require(!published(token_name), ERR_ALREADY_PUBLISHED);
        uint256 token_id = _token_storage.getTokenId(token_name);
        _token_storage.safeTransferFrom(msg.sender, address(this), token_id);
        _publish_history[token_name] = true;
        _sold_history[token_name] = false;
        _inventory.push(Item(token_name, _token_storage.tokenURI(token_id), price, msg.sender));
        _arr_indexing[token_name] = _inventory.length-1;
    }

    function getPublishedSells()
        public
        view
        returns (Item[] memory)
    {
        return _inventory;
    }

    /*
    *@dev allows a user to pulish an offert for their tokens
    */ 
    function sold(string memory token_name)
        public
        view
        returns (bool)
    {
        return _sold_history[token_name];
    }

    /*
    *@dev checks if the offer made matches the token's price
    */    
    function isEnough(string memory token_name, uint256 offer)
        public
        view
        returns (bool)
    {
        return _inventory[_arr_indexing[token_name]]._price == offer;
    }
        
    /*
    *@dev removes an item from the inventory
    */        
    function removeItem(string memory token_name)
        public
    {
        uint256 index = _arr_indexing[token_name];
        uint256 last_index = _inventory.length-1;
        if(index != last_index){
            _inventory[index] = _inventory[last_index];
            _arr_indexing[_inventory[index]._name] = index;
        }
        _inventory.pop();
        _arr_indexing[token_name] = 0;
    }
    /*
    *@dev allows a user to buy a published token
    *after the token is transfered the rights over the token given to this contract,
    * get taken away
    */
    function buy(string memory token_name)
        payable
        external
    {
        require(_token_storage.exists(token_name), ERR_NO_TOKEN);
        require(published(token_name), ERR_NOT_PUBLISHED);
        require(!sold(token_name), ERR_ALREADY_SOLD);
        require(isEnough(token_name, msg.value), ERR_NOT_ENOUGH);
        uint256 token_id = _token_storage.getTokenId(token_name);
        Item memory item = _inventory[_arr_indexing[token_name]];
        address payable seller = payable(item._seller);
        seller.transfer(msg.value);
        _token_storage.safeTransferFrom(address(this), msg.sender, token_id);
        removeItem(token_name);
        _publish_history[token_name] = false;
        _sold_history[token_name] = true;
    }

}