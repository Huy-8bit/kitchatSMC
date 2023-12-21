// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CampaignPoolSwap.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FactoryPool is Ownable {
    address public CampaignPoolSwapTemplate;

    address[] public campaignsAddresses;

    struct Campaign {
        address owner;
        address campaignAddress;
        address token0;
        address token1;
    }

    event CampaignCreated(
        address owner,
        address indexed campaignAddress,
        address token0,
        address token1
    );

    mapping(address => Campaign) public campaigns;

    mapping(address => address[]) public campaignsByOwner;

    constructor(address _CampaignPoolSwapTemplate) {
        CampaignPoolSwapTemplate = _CampaignPoolSwapTemplate;
    }

    function createNewCampaign(
        address _token0,
        address _token1,
        uint256 _swapFee,
        uint256 _ratio
    ) external {
        address campaignAddress = Clones.clone(CampaignPoolSwapTemplate);
        CampaignPoolSwap(campaignAddress).initialize(
            _token0,
            _token1,
            _swapFee,
            _ratio
        );
        campaigns[campaignAddress] = Campaign(
            msg.sender,
            campaignAddress,
            _token0,
            _token1
        );
        campaignsByOwner[msg.sender].push(campaignAddress);

        //transferOwnership
        Ownable(campaignAddress).transferOwnership(msg.sender);

        emit CampaignCreated(msg.sender, campaignAddress, _token0, _token1);
        // add campaignAddress to campaignsAddresses
        campaignsAddresses.push(campaignAddress);
    }

    function getCampaignsAddresses() external view returns (address[] memory) {
        return campaignsAddresses;
    }

    function getCampaignsByOwner(
        address _owner
    ) external view returns (address[] memory) {
        return campaignsByOwner[_owner];
    }

    function getCampaign(
        address _campaignAddress
    ) external view returns (address, address, address) {
        Campaign memory campaign = campaigns[_campaignAddress];
        return (campaign.owner, campaign.token0, campaign.token1);
    }
}
