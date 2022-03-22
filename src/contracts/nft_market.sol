// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MarketMinter is ERC721URIStorage{

    using Counters for Counters.Counter;
    Counters.Counter private _token_ids;
    
    constructor() public ERC721("NFTMarket", "NFTMarket"){
    }

    function mintNFT(address recipient, string memory token_uri)
        external
    {
        uint256 item_id = _token_ids.current();
        _mint(recipient, item_id);
        _setTokenURI(item_id, token_uri);
        _token_ids.increment();
    }
}