import { useState } from 'react';
import Web3 from 'web3';

const Authenticate = ({onAuthenticate}) => {
    const [account, setAccount] = useState('');
    const [signature, setSignature] = useState('');
    const [error, setError] = useState('');

    const signMessage = async (account) => {
        const message = "TECH TALK - Please sign this message to confirm your authentication with the Ethereum network.";
        return await new Web3(window.ethereum).eth.personal.sign(Web3.utils.utf8ToHex(message), account, '');
    }

    const authenticate = async () => {
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            setAccount(accounts[0]);
            const signedMessage = await signMessage(accounts[0]);
            setSignature(signedMessage);
            onAuthenticate(accounts[0]);
            setError('');
        } catch (err) {
            setError("User rejected the request.");
        }
    }

    return (
        <div className="container">
            <h2>Authenticate with MetaMask</h2>
            <button onClick={authenticate} className="button">Authenticate</button>
            {error && <div>{error}</div>}
            <div>
                <strong>Authenticated Address:</strong> {account}
            </div>
            <div>
                <strong>Signature:</strong> {signature}
            </div>
        </div>
    );
};

export default Authenticate;
