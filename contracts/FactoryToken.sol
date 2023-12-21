// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CampaignTypesTokenERC20.sol";
import "./NFT.sol";

contract FactoryToken is Ownable {
    address public campaignTypesTokenERC20Template;
    NFTSplittingME private nft;

    mapping(address => uint256) public campaigns;

    mapping(address => address[]) public campaignsByOwner;

    struct Campaign {
        address owner;
        address campaignAddress;
        uint256 NFTID;
    }

    event CampaignCreated(
        address owner,
        address campaignAddress,
        uint256 indexed NFTID
    );

    mapping(uint256 => Campaign) public campaignsByID;

    mapping(address => uint256) public slotMintNFT;
    mapping(uint256 => bool) public NFTsUsed;

    constructor(address _campaignTypesTokenERC20Template, address _nft) {
        campaignTypesTokenERC20Template = _campaignTypesTokenERC20Template;
        nft = NFTSplittingME(_nft);
    }

    function addSlotMintNFT(address _address) external onlyOwner {
        slotMintNFT[_address] += 1;
    }

    function mintNFT(string memory _tokenURI) external {
        require(slotMintNFT[msg.sender] > 0, "You don't have any slot");
        uint256 tokenID = nft.mintNFT(msg.sender, _tokenURI);
        campaigns[msg.sender] += 1;
        slotMintNFT[msg.sender] -= 1;
        NFTsUsed[tokenID] = false;
    }

    function createNewCampaign(
        string memory _name,
        string memory _symbol,
        uint256 _NFTID
    ) external {
        require(campaigns[msg.sender] > 0, "You don't have any NFT");
        require(
            nft.ownerOf(_NFTID) == msg.sender,
            "You are not the owner of this NFT"
        );

        require(NFTsUsed[_NFTID] == false, "This NFT is already used");

        address newCampaign = Clones.clone(campaignTypesTokenERC20Template);

        // Initialize the campaign
        CampaignTypesTokenERC20(newCampaign).initialize(_name, _symbol);

        // Transfer ownership to the caller of this function
        Ownable(newCampaign).transferOwnership(msg.sender);
        campaignsByOwner[msg.sender].push(newCampaign);
        campaigns[msg.sender] -= 1;
        NFTsUsed[_NFTID] = true;
        campaignsByID[_NFTID] = Campaign(msg.sender, newCampaign, _NFTID);

        nft.transferFrom(msg.sender, address(this), _NFTID);

        emit CampaignCreated(msg.sender, newCampaign, _NFTID);
    }

    function getNFTReadyCreate(
        address _users
    ) external view returns (uint256[] memory) {
        uint256[] memory tokenIds = nft.getAllNFT(_users);
        uint256[] memory tokenIdsReady = new uint256[](tokenIds.length);
        uint256 count = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (NFTsUsed[tokenIds[i]] == false) {
                tokenIdsReady[count] = tokenIds[i];
                count++;
            }
        }
        return tokenIdsReady;
    }

    function getAllCampaignsByOwner(
        address _owner
    ) external view returns (address[] memory) {
        return campaignsByOwner[_owner];
    }

    function withdrawNFT(uint256 _NFTID) external {
        Campaign storage campaign = campaignsByID[_NFTID];
        address campaignAddress = campaign.campaignAddress;

        require(
            msg.sender == campaign.owner,
            "Only the owner can withdraw the NFT"
        );

        require(
            CampaignTypesTokenERC20(campaignAddress).totalSupply() == 0,
            "TotalSupply must be 0 to withdraw the NFT"
        );

        nft.transferFrom(address(this), msg.sender, _NFTID);
        NFTsUsed[_NFTID] = false;
    }
}
