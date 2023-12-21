// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTSplittingME is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public FactoryToken;

    constructor() ERC721("Splitting ME NFT", "BNFT") {
        FactoryToken = msg.sender;
    }

    function initialize(address _FactoryToken) external onlyOwner {
        require(msg.sender == FactoryToken, "You are not the FactoryToken");
        FactoryToken = _FactoryToken;
    }

    function mintNFT(
        address to,
        string memory tokenURI
    ) external returns (uint256) {
        require(msg.sender == FactoryToken, "You are not the FactoryToken");
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    function transferNFT(address to, uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this NFT"
        );
        safeTransferFrom(msg.sender, to, tokenId);
    }

    function transferOwnershipNFT(address to) external onlyOwner {
        transferOwnership(to);
    }

    function getAllNFT(address _owner) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_tokenIds.current());
        uint256 counter = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (ownerOf(i) == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function burn(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this NFT"
        );
        _burn(tokenId);
    }
}
