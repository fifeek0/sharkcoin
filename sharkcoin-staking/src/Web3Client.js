import Web3 from 'web3';

let web3;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.request({ method: 'eth_requestAccounts' }).catch(console.error);
} else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
} else {
    console.error("Non-Ethereum browser detected. You should consider trying MetaMask!");
}

export default web3;
