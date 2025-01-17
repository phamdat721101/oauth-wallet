import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
import { TwitterLoginButton } from 'react-twitter-login';
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

  // Handle Google OAuth success
  const handleGoogleLoginSuccess = (credentialResponse) => {
    const userInfo = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    const identifier = `google_${userInfo.sub}`; // Use `sub` as the unique identifier
    saveUserIdentifier(identifier);
  };

  // Handle GitHub OAuth success
  const handleGitHubLoginSuccess = (response) => {
    const identifier = `github_${response.id}`; // Use GitHub ID as the unique identifier
    saveUserIdentifier(identifier);
  };

  // Handle GitHub OAuth failure
  const handleGitHubLoginFailure = (error) => {
    console.error('GitHub Login Failed:', error);
  };

  // Handle Twitter OAuth success
  const handleTwitterLoginSuccess = (response) => {
    const identifier = `twitter_${response.id_str}`; // Use Twitter ID as the unique identifier
    saveUserIdentifier(identifier);
  };

  // Handle Twitter OAuth failure
  const handleTwitterLoginFailure = (error) => {
    console.error('Twitter Login Failed:', error);
  };

  // Save user identifier and generate wallet
  const saveUserIdentifier = (identifier) => {
    localStorage.setItem('userIdentifier', identifier);
    setUserIdentifier(identifier);
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
        <h1>EVM Wallet with OAuth2</h1>
        {!userIdentifier ? (
          <div>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                console.error('Google Login Failed');
              }}
            />
            <GitHubLogin
              clientId={process.env.REACT_APP_GITHUB_CLIENT_ID}
              redirectUri={process.env.REACT_APP_GITHUB_REDIRECT_URI}
              onSuccess={handleGitHubLoginSuccess}
              onFailure={handleGitHubLoginFailure}
              buttonText="Login with GitHub"
              className="github-login-button"
            />
            <TwitterLoginButton
              authCallback={handleTwitterLoginSuccess}
              onFailure={handleTwitterLoginFailure}
              consumerKey={process.env.REACT_APP_TWITTER_CLIENT_ID}
              consumerSecret={process.env.REACT_APP_TWITTER_CLIENT_SECRET}
              callbackUrl={process.env.REACT_APP_TWITTER_REDIRECT_URI}
              buttonTheme="light"
              className="twitter-login-button"
            >
              Login with Twitter
            </TwitterLoginButton>
          </div>
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