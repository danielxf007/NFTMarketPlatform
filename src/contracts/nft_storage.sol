// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract TokenStorage is ERC721URIStorage{

    string private ERR_ALREADY_STORED = "There is already an NFT using this name";

    using Counters for Counters.Counter;
    Counters.Counter private _token_ids;
    mapping(string => uint256) private _storage;
    
    /*
    *@dev initializes the TokenStorage
    */
    constructor() public ERC721("NFTMarket", "NFTMarket"){
        _token_ids.increment();
    }

    /*
    *@dev creates a token and gives it to the recipient,
    *if the name has already been used the function fails
    */
    function mintNFT(string memory token_name, address recipient, string memory token_uri)
        external
    {
        require(!usedName(token_name), ERR_ALREADY_STORED);
        uint256 item_id = _token_ids.current();
        _mint(recipient, item_id);
        _setTokenURI(item_id, token_uri);
        _storage[token_name] = item_id;
        _token_ids.increment();
    }

    /*
    *@dev checks if a name was already used
    */
    function usedName(string memory token_name)
        public
        view
        returns (bool)
    {
        return _storage[token_name] != 0;
    }

    /*
    *@dev checks if a token was minted
    */
    function exists(string memory token_name)
        public
        view
        returns (bool)
    {
        return _storage[token_name] != 0;
    }

    /*
    *@dev checks if the user can trade the token
    */
    function canTrade(string memory token_name, address user)
        public
        view
        returns (bool)
    {
        return ownerOf(getTokenId(token_name)) == user;
    }

    /*
    *@dev allows a beneficiary to trade the specific token
    */
    function giveRights(string memory token_name, address beneficiary)
        external
    {
        approve(beneficiary, _storage[token_name]);
    }

    /*
    *@dev gives the token ID associated with the token name
    */
    function getTokenId(string memory token_name)
        public
        view
        returns (uint256)
    {
        return _storage[token_name];
    }
    
    /*
    *@dev retrives the uri associated with the token
    */
    function getTokenUri(string memory token_name)
        public
        view
        returns (string memory)
    {
        return tokenURI(getTokenId(token_name));
    }
}