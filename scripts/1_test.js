// test nft marketplace

const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { id } = require("ethers/lib/utils");
const utils = ethers.utils;
require("dotenv").config();

// comandline: npx hardhat test scripts/1_test.js --network sepolia

const TokenFilePath = "./deployment/SplittingToken.json";
const TokenSaleFilePath = "./deployment/TokenSale.json";
const USDTFilePath = "./deployment/USDT.json";

const tokenData = fs.readFileSync(TokenFilePath);
const tokenJSON = JSON.parse(tokenData);
const tokenAddress = tokenJSON.address;

const tokenSaleData = fs.readFileSync(TokenSaleFilePath);
const tokenSaleJSON = JSON.parse(tokenSaleData);
const tokenSaleAddress = tokenSaleJSON.address;

const USDTData = fs.readFileSync(USDTFilePath);
const USDTJSON = JSON.parse(USDTData);
const USDTAddress = USDTJSON.address;

const addres_recipient = "0x657888B7eCBEF11bb4c446C6a1d61FF979468c70";

describe("Splitting Me", function () {
  beforeEach(async function () {
    const SplittingToken = await ethers.getContractFactory("SplittingToken");
    splittingToken = await SplittingToken.attach(tokenAddress);

    const TokenSale = await ethers.getContractFactory("TokenSale");
    tokenSale = await TokenSale.attach(tokenSaleAddress);

    const USDT = await ethers.getContractFactory("USDT");
    uSDT = await USDT.attach(USDTAddress);

    [owner] = await ethers.getSigners();
    console.log("owner: ", owner.address);
    console.log("SplittingToken: ", splittingToken.address);
    console.log("TokenSale: ", tokenSale.address);
  });

  describe("Token", function () {
    // it("Should transfer 5000000 USDT to recipient", async function () {
    //   const amount = utils.parseEther("5000000");
    //   const result = await uSDT.transfer(addres_recipient, amount);
    //   console.log("result: ", result);
    // });

    it("Should get price package", async function () {
      const price = await tokenSale.getPrice(0);
      console.log("price: ", price.toString());
    });
    // it("should one buyPackage", async function () {
    //   packageBuy = 0;
    //   var price = await tokenSale.getPrice(packageBuy);
    //   console.log("price: ", price.toString());
    //   _value = price.toString();
    //   // approve usdt to tokenSale
    //   const approve = await uSDT.approve(tokenSale.address, _value);
    //   console.log("approve: ", approve);
    //   const result = await tokenSale.buyPackage(packageBuy, _value);
    //   console.log("result: ", result);
    //   // delay 15s
    //   await new Promise((r) => setTimeout(r, 15000));
    // });
    // it("should multi buyPackage", async function () {
    //   for (var i = 0; i < 10; i++) {
    //     packageBuy = 1;
    //     var price = await tokenSale.getPrice(packageBuy);
    //     console.log("price: ", price.toString());
    //     _value = price.toString();
    //     // approve usdt to tokenSale
    //     const approve = await uSDT.approve(tokenSale.address, _value);
    //     console.log("approve: ", approve.hash);
    //     const result = await tokenSale.buyPackage(packageBuy, _value);
    //     console.log("result: ", result.hash);
    //     // delay 15s
    //     await new Promise((r) => setTimeout(r, 15000));
    //   }
    // });
    // it("should buyPackage", async function () {
    //   const price = await tokenSale.getPrice("Bronze");
    //   console.log("price: ", price.toString());
    //   _value = price.toString();
    //   const result = await tokenSale.buyPackageWithReferral(
    //     "Bronze",
    //     "0x469f72990944a8b60664A2e5185635b266E826b0",
    //     {
    //       value: _value,
    //     }
    //   );
    //   console.log("result: ", result);
    // });
  });
});
