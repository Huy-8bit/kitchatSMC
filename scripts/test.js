const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Launchpad Contract", function () {
  let Launchpad, launchpad;
  let owner, user1, user2;
  let tokenAddress, tokenInvested;
  let projectDetails;
  let projectId;

  before(async function () {
    Launchpad = await ethers.getContractFactory("Launchpad");
    [owner, user1, user2] = await ethers.getSigners();

    tokenAddress = "0x9b6C42fd47b7b334Ae8BF4faAa4C0e5C01e44dd5"; // Replace with actual token address
    tokenInvested = "0x1e0516962D607D9c54817A742A22bb60976C5Aed"; // Replace with actual token address
  });

  beforeEach(async function () {
    launchpad = await Launchpad.deploy();
    await launchpad.deployed();

    projectDetails = {
      tokenAddress,
      tokenInvested,
      tokenPrice: ethers.utils.parseUnits("1", 18),
      maxTokenPerUser: ethers.utils.parseUnits("100", 18),
      maxCapacity: ethers.utils.parseUnits("1000", 18),
      minTokenPerUser: ethers.utils.parseUnits("10", 18),
      startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour later
      endTime: Math.floor(Date.now() / 1000) + 86400, // 1 day later
    };

    // Owner creates a project
    await launchpad.createProject(
      projectDetails.tokenAddress,
      projectDetails.tokenInvested,
      projectDetails.tokenPrice,
      projectDetails.maxTokenPerUser,
      projectDetails.maxCapacity,
      projectDetails.minTokenPerUser,
      projectDetails.startTime,
      projectDetails.endTime
    );

    projectId = await launchpad.totalProject();
  });

  describe("Creating a project", function () {
    it("should allow owner to create a project", async function () {
      await expect(
        launchpad.createProject(
          projectDetails.tokenAddress,
          projectDetails.tokenInvested,
          projectDetails.tokenPrice,
          projectDetails.maxTokenPerUser,
          projectDetails.maxCapacity,
          projectDetails.minTokenPerUser,
          projectDetails.startTime,
          projectDetails.endTime
        )
      ).to.emit(launchpad, "ProjectListed");
    });
  });

  describe("Investing in a project", function () {
    it("should allow users to invest in a project", async function () {
      const investmentAmount = ethers.utils.parseUnits("50", 18);

      await expect(launchpad.connect(user1).invest(projectId, investmentAmount))
        .to.emit(launchpad, "ProjectInvested")
        .withArgs(projectId, user1.address, investmentAmount);
    });
  });

  describe("Withdraw from a project", function () {
    it("should allow project owner to withdraw", async function () {
      // Forward time to after project end
      await ethers.provider.send("evm_increaseTime", [86400 + 1]);
      await ethers.provider.send("evm_mine");

      await expect(launchpad.connect(owner).withdrawProject(projectId)).to.emit(
        launchpad,
        "ProjectWithdrawn"
      ); // Assuming this event exists
    });
  });

  describe("Claiming from a project", function () {
    it("should allow investors to claim after project ends", async function () {
      // Forward time to after project end
      await ethers.provider.send("evm_increaseTime", [86400 + 1]);
      await ethers.provider.send("evm_mine");

      await expect(launchpad.connect(user1).claimProject(projectId)).to.emit(
        launchpad,
        "ProjectClaimed"
      ); // Assuming this event exists
    });
  });
});
