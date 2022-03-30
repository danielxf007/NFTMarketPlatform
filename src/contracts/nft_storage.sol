// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract TokenStorage is ERC721URIStorage{

    string private ERR_ALREADY_STORED = "There is already an NFT using this name";

    using Counters for Counters.Counter;
    Counters.Counter private _token_ids;
    mapping(string => uint256) private _storage;
    
    constructor() public ERC721("NFTMarket", "NFTMarket"){
        _token_ids.increment();
    }

    function mintNFT(string memory token_name, address recipient, string memory token_uri)
        external
    {
        uint256 item_id = _token_ids.current();
        _mint(recipient, item_id);
        _setTokenURI(item_id, token_uri);
        _storage[token_name] = item_id;
        _token_ids.increment();
    }

    function giveRights(string memory token_name, address beneficiary)
        external
    {
        approve(beneficiary, _storage[token_name]);
    }

    function getTokenId(string memory token_name)
        public
        view
        returns (uint256)
    {
        return _storage[token_name];
    }

    function getTokenUri(string memory token_name)
        public
        view
        returns (string memory)
    {
        return tokenURI(getTokenId(token_name));
    }
}