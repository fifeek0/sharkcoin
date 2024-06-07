const SharkCoin = artifacts.require("SharkCoin");
const SharkCoinStaking = artifacts.require("SharkCoinStaking");

contract("SharkCoinStaking Tests", async (accounts) => {
    let sharkCoin, sharkCoinStaking;
    const initialSupply = web3.utils.toWei('1000000', 'ether');

    before(async () => {
        sharkCoin = await SharkCoin.new(initialSupply);
        sharkCoinStaking = await SharkCoinStaking.new(sharkCoin.address);
    });

    it("should mint tokens to the first account", async () => {
        const balance = await sharkCoin.balanceOf(accounts[0]);
        assert.equal(balance.toString(), initialSupply, "Initial minting failed or incorrect balance");
    });

    it("should approve SharkCoinStaking to spend tokens", async () => {
        const stakeAmount = web3.utils.toWei('1000', 'ether');
        await sharkCoin.approve(sharkCoinStaking.address, stakeAmount, {from: accounts[0]});
        const allowance = await sharkCoin.allowance(accounts[0], sharkCoinStaking.address);
        assert.equal(allowance.toString(), stakeAmount, "Allowance was not set correctly");
    });

    it("should stake tokens successfully", async () => {
        const stakeAmount = web3.utils.toWei('1000', 'ether');
        const initialBalance = await sharkCoin.balanceOf(accounts[0]);

        await sharkCoinStaking.stake(stakeAmount, {from: accounts[0]});

        const finalBalance = await sharkCoin.balanceOf(accounts[0]);
        const stakedBalance = await sharkCoinStaking.stakes(accounts[0], 0); // <--- change here

        assert.equal(finalBalance.toString(), initialBalance.sub(web3.utils.toBN(stakeAmount)).toString(), "Token balance after staking is incorrect");
        assert.equal(stakedBalance.amount.toString(), stakeAmount, "Staked amount is incorrect");
    });

    it("should correctly return user's unlocked balance through getUnlockedBalance", async () => {
        const totalBalance = await sharkCoin.balanceOf(accounts[0]);
        const frozenBalance = await sharkCoin.getFrozenBalance(accounts[0]);
        const expectedUnlockedBalance = web3.utils.toBN(totalBalance).sub(web3.utils.toBN(frozenBalance)).toString(); // total balance - frozen balance

        const unlockedBalance = await sharkCoinStaking.getUnlockedBalance(accounts[0]);
        assert.equal(unlockedBalance.toString(), expectedUnlockedBalance, "getUnlockedBalance did not return correct balance");
    });

    it("should unstake tokens successfully", async () => {
        const stakeAmount = web3.utils.toWei('1000', 'ether');
        const initialBalance = await sharkCoin.balanceOf(accounts[0]);

        // Staking some tokens
        await sharkCoinStaking.stake(stakeAmount, {from: accounts[0]});

        // Unstaking
        await sharkCoinStaking.unstake(0, {from: accounts[0]});

        // Validate final balance and stakes length
        const finalBalance = await sharkCoin.balanceOf(accounts[0]);
        const userStakes = await sharkCoinStaking.stakes(accounts[0]);

        assert.equal(finalBalance.toString(), initialBalance.toString(), "Final balance after unstaking is incorrect");
        assert.equal(userStakes.length, 0, "Unstaking failed or stake length incorrect after unstaking");
    });
});
