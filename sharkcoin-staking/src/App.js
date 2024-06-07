import React, { useState } from 'react';
import Staking from './Staking';
import Authenticate from './Authenticate';

function App() {
    const [account, setAccount] = useState('');

    const handleAuthenticate = (account) => {
        setAccount(account);
    }

    return (
        <div className="App">
            <Authenticate onAuthenticate={handleAuthenticate} />
            {account && <Staking />}
        </div>
    );
}

export default App;
