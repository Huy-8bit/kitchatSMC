const { ethers } = require("hardhat");
const fs = require("fs");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
const utils = ethers.utils;

// comandline: npx hardhat run scripts/4_deploy.js --network sepolia
// comandline: npx hardhat verify --network sepolia
const TokenFilePath = "./deployment/USDT.json";
const NFTSplittingMEFilePath = "./deployment/NFTSplittingME.json";

const TokenFileData = fs.readFileSync(TokenFilePath);
const TokenJSON = JSON.parse(TokenFileData);
const TokenAddress = TokenJSON.address;
const NFTSplittingMEFileData = fs.readFileSync(NFTSplittingMEFilePath);
const NFTSplittingMEJSON = JSON.parse(NFTSplittingMEFileData);
const NFTSplittingMEAddress = NFTSplittingMEJSON.address;

const MarketPlaceFilePath = "./deployment/MarketPlace.json";
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  const balanceBefore = await deployer.getBalance();
  console.log(
    "Account balance before deployment:",
    utils.formatEther(balanceBefore)
  );

  console.log("NFTSplittingME Contract address:", NFTSplittingMEAddress);
  console.log("Token Contract address:", TokenAddress);

  // deploy marketplace
  const MarketPlace = await ethers.getContractFactory("NFTMarketplace");
  const marketPlace = await MarketPlace.deploy(
    NFTSplittingMEAddress,
    TokenAddress
  );
  await marketPlace.deployed();
  console.log("Marketplace address: ", marketPlace.address);
  dataSave = {
    name: "Marketplace",
    address: marketPlace.address,
  };
  fs.writeFileSync(MarketPlaceFilePath, JSON.stringify(dataSave));
  console.log("Deployment completed. Data saved to respective JSON files.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
