const { ethers } = require("hardhat");
const fs = require("fs");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
const utils = ethers.utils;

// comandline: npx hardhat run scripts/1_deploy.js --network sepolia

const TokenFilePath = "./deployment/SplittingToken.json";
const TokenSaleFilePath = "./deployment/TokenSale.json";
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    utils.formatEther(await deployer.getBalance()).toString()
  );

  // // deploy USDT
  // const USDT = await ethers.getContractFactory("USDT");
  // const uSDT = await USDT.deploy();
  // await uSDT.deployed();
  // console.log("USDT address:", "0x55d398326f99059fF775485246999027B3197955");
  // console.log("Token total supply:", (await uSDT.totalSupply()).toString());

  const USDTData = {
    name: "USDT Token",
    address: "0x55d398326f99059fF775485246999027B3197955",
  };
  const USDTTokenJsonData = JSON.stringify(USDTData, null, 2);
  fs.writeFileSync("./deployment/USDT.json", USDTTokenJsonData);

  // deploy RWA
  const RWA = await ethers.getContractFactory("SplittingToken"); // Replace with your actual RWA contract name
  const rwaContract = await RWA.deploy();
  await rwaContract.deployed();
  console.log("RWA Contract address:", rwaContract.address);
  console.log(
    "Token total supply:",
    (await rwaContract.totalSupply()).toString()
  );
  var dataSave = {
    name: "SplittingToken",
    address: rwaContract.address,
  };
  fs.writeFileSync(TokenFilePath, JSON.stringify(dataSave, null, 2));

  // deploy TokenSale
  const TokenSale = await ethers.getContractFactory("TokenSale"); // Replace with your actual TokenSale contract name
  const tokenSaleContract = await TokenSale.deploy(
    rwaContract.address,
    "0x55d398326f99059fF775485246999027B3197955"
  );
  await tokenSaleContract.deployed();
  console.log("TokenSale Contract address:", tokenSaleContract.address);
  dataSave = {
    name: "TokenSale",
    address: tokenSaleContract.address,
  };
  fs.writeFileSync(TokenSaleFilePath, JSON.stringify(dataSave, null, 2));
  console.log("Deployment completed. Data saved to respective JSON files.");

  // tranfer all tokens to TokenSale contract
  const totalSupply = await rwaContract.totalSupply();
  const totalSupplyInWei = utils.parseEther(totalSupply.toString());
  console.log("Total supply: ", totalSupplyInWei.toString());
  await rwaContract.transfer(dataSave.address.toString(), totalSupply);
  console.log("All tokens transferred to TokenSale contract.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
