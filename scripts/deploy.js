const { ethers } = require("hardhat");
const fs = require("fs");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
const utils = ethers.utils;

// command line: npx hardhat run scripts/deploy.js --network sepolia
// command line: npx hardhat verify --network sepolia <contract address> <constructor arguments>
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy USDT
  const USDT = await ethers.getContractFactory("USDT");
  const uSDT = await USDT.deploy();
  await uSDT.deployed();
  console.log("USDT address:", uSDT.address);
  console.log("Token total supply:", (await uSDT.totalSupply()).toString());

  const USDTData = {
    name: "USDT Token",
    USDTAddress: uSDT.address,
  };
  const USDTTokenJsonData = JSON.stringify(USDTData, null, 2);
  fs.writeFileSync("./deployment/USDT.json", USDTTokenJsonData);

  // deploy TOKEN
  const TOKEN = await ethers.getContractFactory("Token");
  const token = await TOKEN.deploy();
  await token.deployed();

  console.log("TOKEN address:", token.address);
  console.log("Token total supply:", (await token.totalSupply()).toString());

  const TOKENData = {
    name: "Token",
    TOKENAddress: token.address,
  };

  const TOKENJsonData = JSON.stringify(TOKENData, null, 2);
  fs.writeFileSync("./deployment/TOKEN.json", TOKENJsonData);

  // deploy launchpad
  const Launchpad = await ethers.getContractFactory("Launchpad");
  const launchpad = await Launchpad.deploy();
  await launchpad.deployed();

  console.log("launchpad address:", launchpad.address);

  const launchpadData = {
    name: "launchpad",
    launchpadAddress: launchpad.address,
  };

  const launchpadJsonData = JSON.stringify(launchpadData, null, 2);
  fs.writeFileSync("./deployment/launchpad.json", launchpadJsonData);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
