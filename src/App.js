import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ethers } from 'ethers'; // Import ethers v6

function App() {
  const [wallet, setWallet] = useState(null);
  const [userIdentifier, setUserIdentifier] = useState(null);

  // Load user identifier from localStorage on component mount
  useEffect(() => {
    const storedIdentifier = localStorage.getItem('userIdentifier');
    if (storedIdentifier) {
      setUserIdentifier(storedIdentifier);
      generateWallet(storedIdentifier); // Regenerate wallet
    }
  }, []);

  // Generate a deterministic wallet from a user identifier
  const generateWallet = (identifier) => {
    const hash = ethers.sha256(ethers.toUtf8Bytes(identifier)); // Hash the identifier
    const privateKey = hash; // Use the hash directly (already prefixed with 0x)
    const newWallet = new ethers.Wallet(privateKey); // Create wallet with the private key
    setWallet(newWallet);
  };

  const handleLoginSuccess = (credentialResponse) => {
    // Decode JWT to get user info
    const userInfo = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    const identifier = userInfo.sub; // Use `sub` as the unique identifier

    // Save the identifier to localStorage
    localStorage.setItem('userIdentifier', identifier);
    setUserIdentifier(identifier);

    // Generate the wallet
    generateWallet(identifier);
  };

  const handleLogout = () => {
    localStorage.removeItem('userIdentifier'); // Clear the identifier
    setUserIdentifier(null);
    setWallet(null);
  };

  const sendTransaction = async () => {
    if (!wallet) {
      console.error('No wallet available');
      return;
    }

    const provider = new ethers.JsonRpcProvider('YOUR_INFURA_PROJECT_ID');
    const walletWithProvider = new ethers.Wallet(wallet.privateKey, provider);

    const tx = {
      to: '0xC4F6D37E83C7597AF7aD26aCf8186F46791fCf7B',
      value: ethers.parseEther('0.01') // Sending 0.01 ETH
    };

    try {
      const transaction = await walletWithProvider.sendTransaction(tx);
      console.log('Transaction sent:', transaction.hash);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="App">
        <h1>EVM Wallet with Google OAuth2</h1>
        {!userIdentifier ? (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => {
              console.error('Login Failed');
            }}
          />
        ) : (
          <div>
            <p>Wallet Address: {wallet?.address}</p>
            <button onClick={sendTransaction}>Send Transaction</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;