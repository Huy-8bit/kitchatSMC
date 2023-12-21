// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./NFT.sol";
import "./USDT.sol";

contract NFTMarketplace is Ownable {
    uint256 public totalNFTs;
    uint256 public platformFee;
    NFTSplittingME public nft;
    USDT public token;

    struct ListedNFT {
        uint256 tokenId;
        address payable seller;
        uint256 price;
    }
    event NFTListedSuccess(
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    mapping(uint256 => ListedNFT) public idToListedNFT;

    uint256[] public listedNFTs;

    address private platformFeeAddress;

    constructor(address _nftAddress, address _tokenAddress) {
        platformFee = 5;
        nft = NFTSplittingME(_nftAddress);
        token = USDT(_tokenAddress);
        platformFeeAddress = msg.sender;
    }

    function listedNFT(uint256 _tokenId, uint256 _price) external {
        require(
            nft.ownerOf(_tokenId) == msg.sender,
            "You are not the owner of this NFT"
        );
        require(
            nft.getApproved(_tokenId) == address(this),
            "You must approve this contract to transfer your NFT"
        );
        require(_price > 0, "Price must be greater than 0");
        require(
            idToListedNFT[_tokenId].tokenId == 0,
            "This NFT has already been listed"
        );

        nft.transferFrom(msg.sender, address(this), _tokenId);

        idToListedNFT[_tokenId] = ListedNFT(
            _tokenId,
            payable(msg.sender),
            _price
        );
        totalNFTs += 1;
        listedNFTs.push(_tokenId);
        emit NFTListedSuccess(_tokenId, msg.sender, _price);
    }

    function buyNFT(uint256 _tokenId) external payable {
        require(
            idToListedNFT[_tokenId].tokenId != 0,
            "This NFT has not been listed yet"
        );
        require(
            idToListedNFT[_tokenId].seller != msg.sender,
            "You are the owner of this NFT"
        );

        address seller = idToListedNFT[_tokenId].seller;
        uint256 price = idToListedNFT[_tokenId].price;

        uint256 platformFeeAmount = (price * platformFee) / 100;
        uint256 sellerAmount = price - platformFeeAmount;

        token.transferFrom(msg.sender, seller, sellerAmount);
        token.transferFrom(msg.sender, platformFeeAddress, platformFeeAmount);

        nft.transferFrom(address(this), msg.sender, _tokenId);

        delete idToListedNFT[_tokenId];

        // remove from listedNFTs array
        for (uint256 i = 0; i < listedNFTs.length; i++) {
            if (listedNFTs[i] == _tokenId) {
                listedNFTs[i] = listedNFTs[listedNFTs.length - 1];
                listedNFTs.pop();
                break;
            }
        }
        totalNFTs -= 1;
    }

    function cancelListedNFT(uint256 _tokenId) external {
        require(
            idToListedNFT[_tokenId].tokenId != 0,
            "This NFT has not been listed yet"
        );
        require(
            idToListedNFT[_tokenId].seller == msg.sender,
            "You are not the owner of this NFT"
        );

        nft.transferFrom(address(this), msg.sender, _tokenId);

        delete idToListedNFT[_tokenId];
        // remove from listedNFTs array
        for (uint256 i = 0; i < listedNFTs.length; i++) {
            if (listedNFTs[i] == _tokenId) {
                listedNFTs[i] = listedNFTs[listedNFTs.length - 1];
                listedNFTs.pop();
                break;
            }
        }
        totalNFTs -= 1;
    }

    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee >= 0 && _platformFee <= 100);
        platformFee = _platformFee;
    }

    function getNFTs() external view returns (uint256[] memory) {
        return listedNFTs;
    }

    function editPrice(uint256 _tokenId, uint256 _price) external {
        require(
            idToListedNFT[_tokenId].tokenId != 0,
            "This NFT has not been listed yet"
        );
        require(
            idToListedNFT[_tokenId].seller == msg.sender,
            "You are not the owner of this NFT"
        );
        require(_price > 0, "Price must be greater than 0");
        idToListedNFT[_tokenId].price = _price;
        emit NFTListedSuccess(_tokenId, msg.sender, _price);
    }

    function getPrice(uint256 _tokenId) external view returns (uint256) {
        require(
            idToListedNFT[_tokenId].tokenId != 0,
            "This NFT has not been listed yet"
        );
        return idToListedNFT[_tokenId].price;
    }
}
