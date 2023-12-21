const { ethers } = require("hardhat");
const fs = require("fs");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
const utils = ethers.utils;

// comandline: npx hardhat run scripts/3_deploy.js --network sepolia
// comandline: npx hardhat verify --network sepolia

const CampaignPoolSwapFilePath = "./deployment/CampaignPoolSwap.json";
const FactoryPoolFilePath = "./deployment/FactoryPool.json";
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    utils.formatEther(await deployer.getBalance()).toString()
  );

  // deploy CampaignPoolSwap contract
  const CampaignPoolSwap = await ethers.getContractFactory("CampaignPoolSwap"); // Replace with your actual CampaignPoolSwap contract name
  const CampaignPoolSwapContract = await CampaignPoolSwap.deploy();
  await CampaignPoolSwapContract.deployed();
  console.log(
    "CampaignPoolSwap Contract address:",
    CampaignPoolSwapContract.address
  );
  dataSave = {
    name: "CampaignPoolSwap",
    address: CampaignPoolSwapContract.address,
  };
  fs.writeFileSync(CampaignPoolSwapFilePath, JSON.stringify(dataSave, null, 2));

  // deploy FactoryPool contract
  const FactoryPool = await ethers.getContractFactory("FactoryPool"); // Replace with your actual FactoryPool contract name
  const FactoryPoolContract = await FactoryPool.deploy(
    CampaignPoolSwapContract.address
  );
  await FactoryPoolContract.deployed();
  console.log("FactoryPool Contract address:", FactoryPoolContract.address);
  dataSave = {
    name: "FactoryPool",
    address: FactoryPoolContract.address,
  };
  fs.writeFileSync(FactoryPoolFilePath, JSON.stringify(dataSave, null, 2));

  console.log("Deployment completed. Data saved to respective JSON files.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
