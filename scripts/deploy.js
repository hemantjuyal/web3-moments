const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const [account] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", account.address);
  const weiBalance = (await account.getBalance()).toString();
  console.log("Account balance:", (await ethers.utils.formatEther(weiBalance)));

  const Web3Marketplace = await hre.ethers.getContractFactory("Web3Marketplace");
  const web3Marketplace = await Web3Marketplace.deploy();
  await web3Marketplace.deployed();
  console.log("web3Marketplace deployed to:", web3Marketplace.address);

  fs.writeFileSync('./config.js', `export const marketplaceAddress = "${web3Marketplace.address}"`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });