# SharkCoin Project README

## Introduction

Welcome to the SharkCoin project! SharkCoin (SHK) is an ERC-20 compliant cryptocurrency designed with unique features such as token burning and freezing, providing both security and deflationary mechanisms. This README will guide you through the functionalities and usage of the SharkCoin smart contract and the SharkCoinStaking smart contract.

## Contracts

### SharkCoin (SHK)

SharkCoin is an ERC-20 token with additional functionalities for burning tokens and locking tokens for a specified period. Below are the key features and functions of the SharkCoin contract:

#### Key Features

- **Token Burning:** A percentage of tokens are burned on each transfer, reducing the total supply over time.
- **Token Freezing:** A portion of tokens can be locked for a specified period, preventing their transfer until they are unlocked.
- **Ownable:** The contract owner has special privileges, such as setting the token burn rate.

#### Functions

- **Constructor:** 
  ```solidity
  constructor(uint256 initialSupply) ERC20("SharkCoin", "SHK") Ownable(msg.sender)
  ```
  Initializes the token with an initial supply, sets the owner, and freezes 40% of the initial supply for 30 days.

- **unlockTokens():** 
  Unlocks frozen tokens after the lock period has expired.

- **transfer() and transferFrom():** 
  Overrides the standard ERC-20 transfer functions to include checks for locked tokens and apply the burn rate.

- **setTokenBurnRatePercent(uint256 _newRate):** 
  Allows the owner to set a new token burn rate.

- **getFrozenBalance(address account):** 
  Returns the amount of tokens frozen for a specific account.

### SharkCoinStaking

The SharkCoinStaking contract allows users to stake their SharkCoins and earn rewards based on an Annual Percentage Rate (APR). This contract ensures that only unlocked tokens can be staked and manages the staking and unstaking processes securely.

#### Key Features

- **Staking:** Users can stake their SHK tokens to earn rewards.
- **Unstaking:** Users can withdraw their staked tokens along with the earned rewards after the staking period.
- **APR Management:** The contract owner can set the APR for staking rewards.
- **ReentrancyGuard:** Ensures that functions are secure from reentrancy attacks.

#### Functions

- **Constructor:** 
  ```solidity
  constructor(IERC20 _sharkCoin) Ownable(msg.sender)
  ```
  Initializes the staking contract with the SharkCoin token.

- **stake(uint256 _amount):** 
  Allows users to stake a specified amount of SHK tokens.

- **unstake(uint256 stakeIndex):** 
  Allows users to withdraw their staked tokens along with the earned rewards.

- **calculateReward(uint256 _amount, uint256 _stakedPeriod):** 
  Calculates the reward based on the staked amount and the staking period.

- **setApr(uint256 _newApr):** 
  Allows the owner to set a new APR for staking rewards.

- **recoverERC20(address tokenAddress, uint256 tokenAmount):** 
  Allows the owner to recover ERC-20 tokens accidentally sent to the contract.

- **unstakedBalanceOf(address account):** 
  Returns the unstaked balance of a user's account.

- **getUnlockedBalance(address account):** 
  Returns the unlocked balance of a user's account.

- **getStakedBalance(address _user):** 
  Returns the total staked balance for a user.

## Usage

### Deployment

1. Deploy the SharkCoin contract with the initial supply:
   ```solidity
   const sharkCoin = await SharkCoin.deploy(initialSupply);
   ```

2. Deploy the SharkCoinStaking contract with the SharkCoin token address:
   ```solidity
   const staking = await SharkCoinStaking.deploy(sharkCoin.address);
   ```

### Interacting with the Contracts

- **Staking SHK Tokens:**
  ```solidity
  await sharkCoin.approve(staking.address, amount);
  await staking.stake(amount);
  ```

- **Unstaking SHK Tokens:**
  ```solidity
  await staking.unstake(stakeIndex);
  ```

- **Setting the APR (Owner Only):**
  ```solidity
  await staking.setApr(newApr);
  ```

- **Unlocking Frozen Tokens:**
  ```solidity
  await sharkCoin.unlockTokens();
  ```

## Events

- **TokenBurnRateChanged:** Emitted when the token burn rate is changed.
- **Staked:** Emitted when tokens are staked.
- **Unstaked:** Emitted when tokens are unstaked.

## License

This project is licensed under the MIT License.

## Conclusion

The SharkCoin project provides a robust framework for a deflationary cryptocurrency with added security through token freezing and incentivization through staking. By leveraging these contracts, users can engage in a secure and rewarding crypto ecosystem. For further details, please refer to the smart contract code and documentation.
