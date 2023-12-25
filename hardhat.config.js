/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("chai");
require("ethers");
require("ethereum-waffle");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// real Account private key

const REAL_ACCOUNTS = (module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [process.env.REAL_ACCOUNTS],
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/GeMVzoOnF9s91czx6zYdUA6mAjA39Q46",
      accounts: [process.env.REAL_ACCOUNTS],
    },
    bnb: {
      url: `wss://bsc.publicnode.com`,
      accounts: [process.env.REAL_ACCOUNTS],
    },
  },
  etherscan: {
    // apiKey: "M64XAN9UH462FXT539BY5DEMBW5UYKAZBG",
    apiKey: "EC7KP6CMPVYJ3CJUIZEWVZWAX8JB2YBUZU",
  },
  mocha: {
    timeout: 100000000,
  },

  solidity: {
    compilers: [
      {
        version: "0.5.7",
      },
      {
        version: "0.8.18",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.8.1",
      },
      {
        version: "0.6.12",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.5.16",
      },
      {
        version: "0.4.18",
      },
    ],

    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
});
