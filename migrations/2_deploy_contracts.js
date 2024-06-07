const SharkCoin = artifacts.require("SharkCoin");
const SharkCoinStaking = artifacts.require("SharkCoinStaking");

module.exports = async function (deployer) {
    await deployer.deploy(SharkCoin, "10000000000000000000000");
    const sharkCoin = await SharkCoin.deployed();

    await deployer.deploy(SharkCoinStaking, sharkCoin.address);
};
