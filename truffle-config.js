const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = ""; // your inuraKey
const privateKey = "";// your wallet

module.exports = {
  networks: {
    sepolia: {
      provider: () =>
          new HDWalletProvider(privateKey, `https://sepolia.infura.io/v3/${infuraKey}`),
      network_id: 11155111, // Sepolia's network ID
      gas: 6000000, // Adjust the gas limit as per your requirements
      gasPrice: 10000000000, // Set the gas price to an appropriate value
      confirmations: 2, // Set the number of confirmations needed for a transaction
      timeoutBlocks: 300, // Set the timeout for transactions
       networkCheckTimeout: 20000,
       skipDryRun: true // Skip the dry run option
    }
  },
  compilers: {
    solc: {
      version: "^0.8.25"
    }
  }
};
