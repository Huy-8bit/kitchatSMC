// command line: npx hardhat run scripts/test.js --network sepolia

const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { id } = require("ethers/lib/utils");
const utils = ethers.utils;

require("dotenv").config();

tokenAddress = "0x9b6C42fd47b7b334Ae8BF4faAa4C0e5C01e44dd5"; // Replace with actual token address
tokenInvestedAddress = "0x1e0516962D607D9c54817A742A22bb60976C5Aed"; // Replace with actual token address
launchpadAddress = "0x45A44bB1f252fe261277Ab803c87574817377aF0"; // Replace with actual launchpad address

describe("Launchpad Contract", function () {
  beforeEach(async function () {
    Launchpad = await ethers.getContractFactory("Launchpad");
    launchpad = await Launchpad.attach(launchpadAddress);
    Token = await ethers.getContractFactory("Token");
    token = await Token.attach(tokenAddress);
    TokenInvested = await ethers.getContractFactory("USDT");
    tokenInvested = await TokenInvested.attach(tokenInvestedAddress);
    [owner] = await ethers.getSigners();

    console.log("launchpad address:", launchpad.address);
    console.log("token address:", token.address);
    console.log("tokenInvested address:", tokenInvested.address);
    console.log("owner address:", owner.address);
  });

  describe("create a project", function () {
    it("should allow owner to create a project", async function () {
      const result = await launchpad.createProject(
        token.address,
        tokenInvested.address,
        ethers.utils.parseUnits("1"),
        ethers.utils.parseUnits("100"),
        ethers.utils.parseUnits("1000"),
        ethers.utils.parseUnits("10"),
        Math.floor(Date.now() / 1000) + 20, // 20 seconds from now
        Math.floor(Date.now() / 1000) + 86400 // 1 day from now
      );
      console.log(result);
    });
  });
  // describe("Investing in a project", function () {
  //   it("should allow users to invest in a project", async function () {
  //     const investmentAmount = ethers.utils.parseUnits("50", 18);

  //     await expect(launchpad.connect(user1).invest(projectId, investmentAmount))
  //       .to.emit(launchpad, "ProjectInvested")
  //       .withArgs(projectId, user1.address, investmentAmount);
  //   });
  // });

  // describe("Withdraw from a project", function () {
  //   it("should allow project owner to withdraw", async function () {
  //     // Forward time to after project end
  //     await ethers.provider.send("evm_increaseTime", [86400 + 1]);
  //     await ethers.provider.send("evm_mine");

  //     await expect(launchpad.connect(owner).withdrawProject(projectId)).to.emit(
  //       launchpad,
  //       "ProjectWithdrawn"
  //     ); // Assuming this event exists
  //   });
  // });

  // describe("Claiming from a project", function () {
  //   it("should allow investors to claim after project ends", async function () {
  //     // Forward time to after project end
  //     await ethers.provider.send("evm_increaseTime", [86400 + 1]);
  //     await ethers.provider.send("evm_mine");

  //     await expect(launchpad.connect(user1).claimProject(projectId)).to.emit(
  //       launchpad,
  //       "ProjectClaimed"
  //     ); // Assuming this event exists
  //   });
  // });
});
