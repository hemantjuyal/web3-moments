require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    goerli: {
      url: process.env.NETWORK_ENDPOINT_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: process.env.NETWORK_ENDPOINT_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
