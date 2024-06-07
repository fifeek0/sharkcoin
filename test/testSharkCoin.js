const SharkCoin = artifacts.require("SharkCoin");

contract("SharkCoin", (accounts) => {
    let sharkCoin;
    const initialSupply = web3.utils.toWei('1000000', 'ether');

    before(async () => {
        sharkCoin = await SharkCoin.new(initialSupply);
    });

    it("should mint the initial supply to the deployer's account", async () => {
        const balance = await sharkCoin.balanceOf(accounts[0]);
        assert.equal(balance.toString(), initialSupply, "Initial supply did not match");
    });

    it("should lock 40% of the deployer's tokens", async () => {
        const lockedTokens = web3.utils.toBN(initialSupply).mul(web3.utils.toBN(40)).div(web3.utils.toBN(100));
        const frozen = await sharkCoin.frozenAccounts(accounts[0]);
        assert.equal(frozen.amount.toString(), lockedTokens.toString(), "Locked tokens amount did not match");
    });


    it("should allow transferring unlocked tokens", async () => {
        const transferAmount = web3.utils.toWei('100', 'ether');
        await sharkCoin.transfer(accounts[1], transferAmount, { from: accounts[0] });
        const balance = await sharkCoin.balanceOf(accounts[1]);
        assert.equal(balance.toString(), transferAmount, "Transfer did not occur correctly");
    });

    it("should transfer tokens between accounts", async () => {
        const transferAmount = web3.utils.toWei('500', 'ether');
        const sender = accounts[0];
        const receiver = accounts[1];

        let senderInitialBalance = await sharkCoin.balanceOf(sender);
        let receiverInitialBalance = await sharkCoin.balanceOf(receiver);

        await sharkCoin.transfer(receiver, transferAmount, { from: sender });

        const senderFinalBalance = await sharkCoin.balanceOf(sender);
        const receiverFinalBalance = await sharkCoin.balanceOf(receiver);

        const expectedSenderFinalBalance = web3.utils.toBN(senderInitialBalance).sub(web3.utils.toBN(transferAmount));
        const expectedReceiverFinalBalance = web3.utils.toBN(receiverInitialBalance).add(web3.utils.toBN(transferAmount));

        assert.equal(senderFinalBalance.toString(), expectedSenderFinalBalance.toString(), "Sender's final balance is incorrect");
        assert.equal(receiverFinalBalance.toString(), expectedReceiverFinalBalance.toString(), "Receiver's final balance is incorrect");
    });

    it("should correctly return user's locked (frozen) balance through getFrozenBalance", async () => {
        const frozenBalance = await sharkCoin.getFrozenBalance(accounts[0]);

        const lockedBalance = await sharkCoin.getFrozenBalance(accounts[0]);
        assert.equal(lockedBalance.toString(), frozenBalance.toString(), "getFrozenBalance did not return correct balance");
    });
});
