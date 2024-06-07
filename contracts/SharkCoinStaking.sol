// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SharkCoin.sol";

contract SharkCoinStaking is ReentrancyGuard, Ownable {
    IERC20 public sharkCoin;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
    }

    uint256 public apr = 10;
    mapping(address => Stake[]) public stakes;
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);

    constructor(IERC20 _sharkCoin) Ownable(msg.sender) {
        sharkCoin = _sharkCoin;
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(SharkCoin(address(sharkCoin)).areTokensUnlocked(msg.sender, _amount), "Tokens must be unlocked");
        sharkCoin.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender].push(Stake(_amount, block.timestamp));
        emit Staked(msg.sender, _amount, block.timestamp);
    }

    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");
        Stake storage userStake = stakes[msg.sender][stakeIndex];
        require(userStake.amount > 0, "No tokens staked");
        require(SharkCoin(address(sharkCoin)).areTokensUnlocked(msg.sender, userStake.amount), "Stake tokens are still locked");
        uint256 stakedPeriod = block.timestamp - userStake.timestamp;
        uint256 reward = calculateReward(userStake.amount, stakedPeriod);
        uint256 totalAmount = userStake.amount + reward;

        sharkCoin.transfer(msg.sender, totalAmount);
        emit Unstaked(msg.sender, userStake.amount, reward, block.timestamp);


        for (uint i = stakeIndex; i < stakes[msg.sender].length-1; i++){
            stakes[msg.sender][i] = stakes[msg.sender][i+1];
        }

        stakes[msg.sender].pop();
    }

    function calculateReward(uint256 _amount, uint256 _stakedPeriod) public view returns (uint256) {
        uint256 rewardRatePerSecond = apr * 1e18 / 365 days / 100;
        return _amount * rewardRatePerSecond * _stakedPeriod / 1e18;
    }

    function setApr(uint256 _newApr) external onlyOwner {
        require(_newApr > 0, "APR must be greater than 0");
        apr = _newApr;
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
    }

    function unstakedBalanceOf(address account) public view returns (uint256) {
        uint256 frozenBalance = SharkCoin(address(sharkCoin)).getFrozenBalance(account);
        return sharkCoin.balanceOf(account) - frozenBalance;
    }
    function getUnlockedBalance(address account) public view returns (uint256) {
        return sharkCoin.balanceOf(account) - SharkCoin(address(sharkCoin)).getFrozenBalance(account);
    }
    function getStakedBalance(address _user) public view returns (uint256) {
        uint256 totalStakedForUser = 0;

        for (uint i = 0; i < stakes[_user].length; i++) {
            if (SharkCoin(address(sharkCoin)).areTokensUnlocked(_user, stakes[_user][i].amount)) {
                totalStakedForUser += stakes[_user][i].amount;
            }
        }

        return totalStakedForUser;
    }
}
