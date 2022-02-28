// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleNFTShop{

    struct ShopData{
        address payable _seller;
        uint256 _price;
        bool _active;
    }
    constructor(){
        
    }

    mapping (uint256 => ShopData) private _shop_book;
    uint256 [] private _token_ids;

    function add(address payable seller, uint256 price, uint256 token_id)
        public
    {
        _shop_book[token_id] = ShopData(seller, price, true);
    }

    function remove(uint256 token_id)
        public
    {
        _shop_book[token_id] = ShopData(payable (0), 0, false);
    }

    function sellerOf(uint256 token_id)
        public
        view
        returns(address payable)
    {
        return _shop_book[token_id]._seller;
    }

    function priceOf(uint256 token_id)
        public
        view
        returns(uint256)
    {
        return _shop_book[token_id]._price;
    }

    function isBeingSold(uint256 token_id)
        public
        view
        returns(bool)
    {
        return _shop_book[token_id]._active;
    }

    function getSellData(uint256 token_id)
        public
        view
        returns(ShopData memory)
    {
        return _shop_book[token_id];
    }

}