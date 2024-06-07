import React, { useState, useEffect } from 'react';
import web3 from './Web3Client';
import SharkCoinStaking from './SharkCoinStaking.json';
import SharkCoinAbi from './SharkCoin.json';

const sharkCoinAddress = '0xDF0F7c98E950E3745099BcCf89052c2A119AA034';
const stakingContractAddress = '0x59Db3ba7DDd144571E3C254936692e783ab05E9a';
const stakingContract = new web3.eth.Contract(SharkCoinStaking.abi, stakingContractAddress);
const sharkCoinContract = new web3.eth.Contract(SharkCoinAbi.abi, sharkCoinAddress);

const Staking = () => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState('');
    const [account, setAccount] = useState('');
    const [staked, setStaked] = useState('');
    const [freeStaked, setFreeStaked] = useState('');
    const [lockedStaked, setLockedStaked] = useState('');


    useEffect(() => {
        const init = async () => {
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);
            const balance = await stakingContract.methods.getUnlockedBalance(accounts[0]).call();;
            setBalance(web3.utils.fromWei(balance, 'ether'));
            await loadStakedAmount(accounts[0]);
            await loadStakedAmount(accounts[0]);
            await loadFreeLockedStakes(accounts[0]);
            window.ethereum.on('accountsChanged', function (accounts) {
                setAccount(accounts[0]);
                updateBalance(accounts[0]);
            });
        };

        init().catch(console.error);
    }, []);

    const updateBalance = async (userAccount) => {
        const balance = await sharkCoinContract.methods.balanceOf(userAccount).call();
        setBalance(web3.utils.fromWei(balance, 'ether'));
    };

    const stakeTokens = async (e) => {
        e.preventDefault();
        if (!amount) return;
        try {
            await sharkCoinContract.methods.approve(
                stakingContractAddress,
                web3.utils.toWei(amount, 'ether')
            ).send({ from: account });

            await stakingContract.methods.stake(
                web3.utils.toWei(amount, 'ether')
            ).send({ from: account });

            updateBalance(account);
            await loadStakedAmount(account);
            await loadFreeLockedStakes(account);
        } catch (error) {
            alert(`Error staking tokens: ${error.message}`);
            console.error("Error staking tokens:", error);
        }
    };

    const unstakeTokens = async () => {
        try {
            await stakingContract.methods.unstake(0).send({ from: account });
            updateBalance(account);
            await loadStakedAmount(account);
            await loadFreeLockedStakes(account);
        } catch (error) {
            alert(`Error unstaking tokens: ${error.message}`);
            console.error("Error unstaking tokens:", error);
        }
    };

    const loadStakedAmount = async (userAccount) => {
        const amount = await stakingContract.methods.unstakedBalanceOf(userAccount).call();
        setStaked(web3.utils.fromWei(amount, 'ether'));
    };

    const loadFreeLockedStakes = async (userAccount) => {
        const freeAmount = await stakingContract.methods.getStakedBalance(userAccount).call();
        const lockedAmount = await sharkCoinContract.methods.getFrozenBalance(userAccount).call();

        setFreeStaked(web3.utils.fromWei(freeAmount, 'ether'));
        setLockedStaked(web3.utils.fromWei(lockedAmount, 'ether'));
    };

    const authenticate = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const message = `Please sign this message to confirm your authentication with the Ethereum network.`;
        const signature = await web3.eth.personal.sign(web3.utils.utf8ToHex(message), account, '');
        return {signature, account};
    }

    const primaryColor = '#FFD700';
    const commonMargin = '10px 0';
    const commonPadding = '5px 10px';

    const divStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        textAlign: 'center',
        backgroundColor: '#008080',
        color: '#FFF',
        fontFamily: 'Arial',
        padding: '10px'
    };

    const hStyle = {color: primaryColor};

    const linkStyle = {color: primaryColor};

    const divInnerStyle = {margin: commonMargin};

    const buttonStyle = {
        backgroundColor: primaryColor,
        borderRadius: '5px',
        color: '#000',
        padding: commonPadding
    };

    const inputStyle = {
        margin: commonMargin,
        width: '200px',
        padding: '5px'
    };

    return (
        <div style={divStyle}>
            <h2 style={hStyle}>SharkCoin Staking</h2>
            <div style={divInnerStyle}>
                <strong>Your tokens: </strong>{balance} SharkCoin
            </div>
            <div style={divInnerStyle}>
                <strong>Unlocked staked tokens: </strong>{freeStaked} SharkCoin
            </div>
            <div style={divInnerStyle}>
                <strong>Locked staked tokens: </strong>{lockedStaked} SharkCoin
            </div>
            <div style={divInnerStyle}>
                <strong>Account: </strong>{account}
                <a href={`https://sepolia.etherscan.io/address/${account}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   style={linkStyle}>
                    View on Etherscan
                </a>
            </div>
            <form onSubmit={stakeTokens}>
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to stake"
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>Stake
                </button>
            </form>
            <button onClick={unstakeTokens} style={{
                ...buttonStyle,
                margin: commonMargin
            }}>Unstake
            </button>
        </div>
    );
};

export default Staking;
