const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { id } = require("ethers/lib/utils");
const utils = ethers.utils;
require("dotenv").config();

// comandline: npx hardhat test scripts/4_test.js --network sepolia
const TokenFilePath = "./deployment/USDT.json";
const NFTSplittingMEFilePath = "./deployment/NFTSplittingME.json";
const MarketPlaceFilePath = "./deployment/MarketPlace.json";

// Read data from an USDT . JSON file
const TokenFileData = fs.readFileSync(TokenFilePath, "utf-8");
const TokenJSON = JSON.parse(TokenFileData);
const TokenAddress = TokenJSON.address;

// Read data from an NFTSplittingME . JSON file
const NFTSplittingMEJsonData = fs.readFileSync(NFTSplittingMEFilePath, "utf-8");
const NFTSplittingMEData = JSON.parse(NFTSplittingMEJsonData);
const NFTSplittingMEAddress = NFTSplittingMEData.address;

// Read data from an MarketPlace . JSON file
const marketPlaceJsonData = fs.readFileSync(MarketPlaceFilePath, "utf-8");
const marketPlaceData = JSON.parse(marketPlaceJsonData);
const MarketPlaceAddress = marketPlaceData.address;

const addres_recipient = "0xf30607e0cdEc7188d50d2bb384073bF1D5b02fA4";

describe("NFTMarketplace", function () {
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const Token = await ethers.getContractFactory("USDT");
    token = await Token.attach(TokenAddress);

    const NFTSplittingME = await ethers.getContractFactory("NFTSplittingME");
    nft = await NFTSplittingME.attach(NFTSplittingMEAddress);

    const MarketPlace = await ethers.getContractFactory("NFTMarketplace");
    marketPlace = await MarketPlace.attach(MarketPlaceAddress);
    [owner] = await ethers.getSigners();
  });
  describe("Deployment", function () {
    it("Should return all address for contract", async function () {
      console.log("NFT address: ", nft.address);
      console.log("Token address: ", token.address);
      console.log("Marketplace address: ", marketPlace.address);
      console.log("Owner address: ", owner.address);
    });
  });

  describe("NFT Marketplace test", function () {
    it("Should listedNFT", async function () {
      tokenId = 2;
      // approve nft
      const result1 = await nft.approve(marketPlace.address, tokenId);
      console.log("NFT approved: ", result1.hash);
      // delay 15 seconds
      await new Promise((r) => setTimeout(r, 15000));
      // list nft
      const result = await marketPlace.listedNFT(
        tokenId,
        ethers.utils.parseEther("40")
      );
      await result.wait();
      console.log("NFT listed: ", result.hash);
    });
    it("Should buy NFT", async function () {
      tokenId = 1;
      // get price nft
      const price = await marketPlace.getPrice(tokenId);
      console.log("Price NFT: ", utils.formatEther(price));
      // approve token
      const result1 = await token.approve(
        marketPlace.address,
        price.toString()
      );
      console.log("Token approved, \n", result1);
      // dalay 15 seconds
      await new Promise((r) => setTimeout(r, 15000));
      // buy nft
      const result = await marketPlace.buyNFT(tokenId);
      await result.wait();
      console.log("NFT bought, \n", result);
    });
    it("Should cancel NFT", async function () {
      // cancel nft
      const result = await marketPlace.cancelListedNFT(1);
      await result.wait();
      console.log("NFT canceled, \n", result);
    });
    it("Should edit price NFT", async function () {
      tokenId = 1;
      // edit price nft
      const result = await marketPlace.editPrice(
        tokenId,
        ethers.utils.parseEther("80")
      );
      await result.wait();
      console.log("NFT price edited, \n", result);
    });
    it("Should withdraw token", async function () {
      // withdraw token
      const result = await marketPlace.withdraw();
      await result.wait();
      console.log("Token withdrawed, \n", result);
    });
  });
});
