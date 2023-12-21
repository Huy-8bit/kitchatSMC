const { ethers } = require("hardhat");
const fs = require("fs");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
const utils = ethers.utils;

// command line: npx hardhat run scripts/deploy_USDT.js --network sepolia

async function main() {
  var tokenAddress = "";
  var nftAddress = "";
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

  tokenAddress = uSDT.address;
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
