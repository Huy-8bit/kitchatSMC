// test nft marketplace

const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { id } = require("ethers/lib/utils");
const utils = ethers.utils;
require("dotenv").config();

// comandline: npx hardhat test scripts/2_test.js --network sepolia

const NFTSplittingMEFilePath = "./deployment/NFTSplittingME.json";
const CampaignTypesTokenERC20FilePath =
  "./deployment/CampaignTypesTokenERC20.json";
const FactoryTokenFilePath = "./deployment/FactoryToken.json";

const NFTSplittingMEData = fs.readFileSync(NFTSplittingMEFilePath);
const NFTSplittingMEJSON = JSON.parse(NFTSplittingMEData);
const NFTSplittingMEAddress = NFTSplittingMEJSON.address;

const CampaignTypesTokenERC20Data = fs.readFileSync(
  CampaignTypesTokenERC20FilePath
);
const CampaignTypesTokenERC20JSON = JSON.parse(CampaignTypesTokenERC20Data);
const CampaignTypesTokenERC20Address = CampaignTypesTokenERC20JSON.address;

const FactoryTokenData = fs.readFileSync(FactoryTokenFilePath);
const FactoryTokenJSON = JSON.parse(FactoryTokenData);
const FactoryTokenAddress = FactoryTokenJSON.address;

// const addres_recipient = "0xf30607e0cdEc7188d50d2bb384073bF1D5b02fA4";
const addres_recipient = "0x96998C9ce6b5f179829E9CFE2d4B1505E43d7F1e";
// Define variables for contract instances and owner
let nftSplittingME;
let campaignTypesTokenERC20;
let factoryToken;
let owner;

describe("Splitting Me", function () {
  beforeEach(async function () {
    const NFTSplittingME = await ethers.getContractFactory("NFTSplittingME");
    nftSplittingME = await NFTSplittingME.attach(NFTSplittingMEAddress);

    const CampaignTypesTokenERC20 = await ethers.getContractFactory(
      "CampaignTypesTokenERC20"
    );
    campaignTypesTokenERC20 = await CampaignTypesTokenERC20.attach(
      CampaignTypesTokenERC20Address
    );

    const FactoryToken = await ethers.getContractFactory("FactoryToken");
    factoryToken = await FactoryToken.attach(FactoryTokenAddress);

    [owner] = await ethers.getSigners();
    console.log("owner: ", owner.address);
    console.log("NFTSplittingME Contract address:", nftSplittingME.address);
    console.log(
      "campaignTypesTokenERC20 Contract address:",
      campaignTypesTokenERC20.address
    );
    console.log("FactoryToken Contract address:", factoryToken.address);
  });

  describe("Splitting Me", function () {
    // it("should add a new slot mintNFT ", async function () {
    //   const result = await factoryToken.addSlotMintNFT(addres_recipient);
    //   console.log("result: ", result);
    // });
    // it("should create a new NFT ", async function () {
    //   const result = await factoryToken.mintNFT("link");
    //   console.log("result: ", result);
    // });
    // it("should get all NFT", async function () {
    //   const result = await nftSplittingME.getAllNFT(owner.address);
    //   console.log("result: ", result);
    // });
    // it("should check NFTsUsed", async function () {
    //   const listNFT = await nftSplittingME.getAllNFT(owner.address);
    //   console.log("listNFT: ", listNFT.toString());
    //   for (let i = 0; i < listNFT.length; i++) {
    //     const result = await factoryToken.NFTsUsed(listNFT[i]);
    //     console.log("result: ", result);
    //   }
    // });
    // it("Should create new CampaignTypesTokenERC20 contract", async function () {
    //   // approve nft
    //   const approve = await nftSplittingME.approve(factoryToken.address, 1);
    //   console.log("approve: ", approve.hash);
    //   const result = await factoryToken.createNewCampaign("BDS1", "CM1", 1);
    //   console.log("result: ", result);
    // });
    // it("should get Campaign", async function () {
    //   const result = await factoryToken.campaignsByID(1);
    //   console.log("result: ", result.campaignAddress);
    // });
    // it("should check list NFT", async function () {
    //   const listNFT = await nftSplittingME.getAllNFT(owner.address);
    //   console.log("listNFT: ", listNFT.toString());
    //   for (let i = 0; i < listNFT.length; i++) {
    //     const result = await factoryToken.NFTsUsed(listNFT[i]);
    //     console.log("result: ", result);
    //   }
    // });
    // it("Should mint token", async function () {
    //   const tokenAddress = await factoryToken.campaignsByID(1);
    //   const tokenContract = await ethers.getContractAt(
    //     "CampaignTypesTokenERC20",
    //     tokenAddress.campaignAddress
    //   );
    //   const result = await tokenContract.mint(
    //     owner.address,
    //     ethers.utils.parseEther("2500000000000000")
    //   );
    //   console.log("result: ", result);
    // });
    // it("Should burn all token of campaign", async function () {
    //   const tokenAddress = await factoryToken.campaignsByID(1);
    //   const tokenContract = await ethers.getContractAt(
    //     "CampaignTypesTokenERC20",
    //     tokenAddress.campaignAddress
    //   );
    //   const totalSupply = await tokenContract.totalSupply();
    //   console.log("totalSupply: ", totalSupply.toString());
    //   const result = await tokenContract.burn(
    //     owner.address,
    //     totalSupply.toString()
    //   );
    //   console.log("result: ", result);
    // });
    // it("Should withdrawNFT ", async function () {
    //   const result = await factoryToken.withdrawNFT(1);
    //   console.log("result: ", result);
    // });
  });
});
