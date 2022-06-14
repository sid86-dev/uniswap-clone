require("@nomiclabs/hardhat-waffle");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/dQz3t-rMcntl-_B1LFjN6pMpNCNsB0Vq',
      accounts: [
        'ae51fc4aa014eab3c072d403bd8d353c3e4e6f2eea13f0fa9c178c50be94ceba',
      ]
    }
  }
};