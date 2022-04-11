// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract TokenStorage is ERC721URIStorage{

    string private ERR_ALREADY_STORED = "There is already an NFT using this name";
    using Counters for Counters.Counter;
    Counters.Counter private _token_ids;
    struct TokenData{
        string _name;
        string _image_url;
    }
    mapping(string => uint256) private _storage; // (name, token_id) pairs
    mapping(address => mapping(uint256 => uint256)) private _arr_indexing; // ((wallet_addr, token_id), arr_index)
    mapping(address => TokenData[]) private _tokens; // (wallet_addr, [token_0, ..., token_i])
    
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
    function mintNFT(string memory token_name, string memory image_url, address recipient)
        external
    {
        require(!usedName(token_name), ERR_ALREADY_STORED);
        uint256 item_id = _token_ids.current();
        uint256 last_index;
        TokenData memory token_data;
        _storage[token_name] = item_id;
        token_data = TokenData(token_name, image_url);
        _tokens[recipient].push(token_data);
        last_index = _tokens[recipient].length-1;
        _arr_indexing[recipient][item_id] = last_index;
        _mint(recipient, item_id);
        _setTokenURI(item_id, image_url);
        _token_ids.increment();
    }

    /*
    *@dev removes a token from the address
    */ 
    function removeToken(address from, uint256 token_id)
        private
        returns (TokenData memory)
    {
        uint256 index = _arr_indexing[from][token_id];
        uint256 last_index = _tokens[from].length-1;
        TokenData memory token = _tokens[from][index];
        TokenData memory last_token;
        if(index != last_index){
            last_token = _tokens[from][last_index];
            _tokens[from][index] = last_token;
            _arr_indexing[from][getTokenId(last_token._name)] = index;
        }
        _tokens[from].pop();
        _arr_indexing[from][token_id] = 0;
        return token;
    }

    /*
    *@dev changes tokes who belong to from and gives it to to
    *when address(0) means that the token was minted
    */    
    function _afterTokenTransfer(address from, address to,uint256 tokenId)
        internal
        virtual
        override 
    {
        super._afterTokenTransfer(from, to, tokenId);
        if(from != address(0)){
            TokenData memory token = removeToken(from, tokenId);
            _tokens[to].push(token);
            _arr_indexing[to][tokenId] = _tokens[to].length-1;
        }
    }


    /*
    *@dev retrives the tokens that belong to the wallet
    */
    function getTokens(address wallet)
        public
        view
        returns(TokenData[] memory)
    {
        return _tokens[wallet];
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