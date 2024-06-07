// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SharkCoin is ERC20, ERC20Burnable, Ownable {
    uint256 public tokenBurnRatePercent = 1;
    uint256 private constant PERCENT_DIVISOR = 100;

    struct FrozenTokens {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => FrozenTokens) public frozenAccounts;

    event TokenBurnRateChanged(uint256 newRate);

    constructor(uint256 initialSupply) ERC20("SharkCoin", "SHK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);

        uint256 lockAmount = (initialSupply * 40) / 100;
        frozenAccounts[msg.sender] = FrozenTokens(lockAmount, block.timestamp + 30 days);
    }

    function unlockTokens() public {
        FrozenTokens storage frozen = frozenAccounts[msg.sender];
        require(block.timestamp >= frozen.unlockTime, "Tokens are still locked");
        require(frozen.amount > 0, "No tokens to unlock");

        uint256 amountToUnlock = frozen.amount;
        frozen.amount = 0;
        _transfer(address(this), msg.sender, amountToUnlock);

        emit Transfer(address(this), msg.sender, amountToUnlock);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(areTokensUnlocked(msg.sender, amount), "Some tokens are still locked");
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(areTokensUnlocked(sender, amount), "Some tokens are still locked");
        return super.transferFrom(sender, recipient, amount);
    }

    function areTokensUnlocked(address account, uint256 amount) public view returns (bool) {
        FrozenTokens storage frozen = frozenAccounts[account];
        uint256 unlockedTokens = balanceOf(account) - frozen.amount;
        return amount <= unlockedTokens;
    }

    function _ensureTokensUnfrozen(address account) internal view {
        FrozenTokens memory frozen = frozenAccounts[account];
        require(block.timestamp >= frozen.unlockTime || frozen.amount == 0, "Tokens still frozen");
    }

    function _calculateAmounts(uint256 amount) internal view returns (uint256, uint256) {
        uint256 burnAmount = amount * tokenBurnRatePercent / PERCENT_DIVISOR;
        uint256 sendAmount = amount - burnAmount;
        return (burnAmount, sendAmount);
    }

    function setTokenBurnRatePercent(uint256 _newRate) public onlyOwner {
        tokenBurnRatePercent = _newRate;
        emit TokenBurnRateChanged(_newRate);
    }

    function getFrozenBalance(address account) public view returns (uint256) {
        return frozenAccounts[account].amount;
    }
}
