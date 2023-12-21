const { ethers } = require("hardhat");
const fs = require("fs");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
const utils = ethers.utils;

// comandline: npx hardhat run scripts/2_deploy.js --network sepolia
// comandline: npx hardhat verify --network sepolia

const TokenFilePath = "./deployment/CampaignTypesTokenERC20.json";
const NFTSplittingMEFilePath = "./deployment/NFTSplittingME.json";
const FactoryTokenFilePath = "./deployment/FactoryToken.json";
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    utils.formatEther(await deployer.getBalance()).toString()
  );

  // deploy CampaignTypesTokenERC20 contract
  const CampaignTypesTokenERC20 = await ethers.getContractFactory(
    "CampaignTypesTokenERC20"
  ); // Replace with your actual RWA contract name
  const campaignTypesTokenERC20 = await CampaignTypesTokenERC20.deploy();
  await campaignTypesTokenERC20.deployed();
  console.log(
    "campaignTypesTokenERC20 Contract address:",
    campaignTypesTokenERC20.address
  );
  var dataSave = {
    name: "CampaignTypesTokenERC20",
    address: campaignTypesTokenERC20.address,
  };
  fs.writeFileSync(TokenFilePath, JSON.stringify(dataSave, null, 2));

  // deploy NFTSplittingME contract
  const NFTSplittingME = await ethers.getContractFactory("NFTSplittingME"); // Replace with your actual NFTSplittingME contract name
  const nftSplittingME = await NFTSplittingME.deploy();
  await nftSplittingME.deployed();
  console.log("NFTSplittingME Contract address:", nftSplittingME.address);

  dataSave = {
    name: "NFTSplittingME",
    address: nftSplittingME.address,
  };

  fs.writeFileSync(NFTSplittingMEFilePath, JSON.stringify(dataSave, null, 2));

  // deploy FactoryToken contract
  const FactoryToken = await ethers.getContractFactory("FactoryToken"); // Replace with your actual FactoryToken contract name
  const factoryTokenContract = await FactoryToken.deploy(
    campaignTypesTokenERC20.address,
    nftSplittingME.address
  );
  await factoryTokenContract.deployed();
  console.log("FactoryToken Contract address:", factoryTokenContract.address);
  dataSave = {
    name: "FactoryToken",
    address: factoryTokenContract.address,
  };
  fs.writeFileSync(FactoryTokenFilePath, JSON.stringify(dataSave, null, 2));

  // NFT initialize factoryTokenContract
  await nftSplittingME.initialize(factoryTokenContract.address);

  console.log("Deployment completed. Data saved to respective JSON files.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
