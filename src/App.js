import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
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

  // Handle Twitter OAuth button click
  const handleTwitterLoginClick = async () => {
    const clientId = process.env.REACT_APP_TWITTER_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_TWITTER_REDIRECT_URI);
    const scope = encodeURIComponent('tweet.read users.read');
    const state = generateRandomString(16); // Optional: Add a state parameter for security
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Save the code verifier in localStorage
    localStorage.setItem('twitter_code_verifier', codeVerifier);

    const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    window.location.href = twitterAuthUrl; // Redirect to Twitter OAuth
  };

  // Handle Twitter OAuth callback
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    if (code) {
      const codeVerifier = localStorage.getItem('twitter_code_verifier');

      // Exchange the code for an access token
      fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: process.env.REACT_APP_TWITTER_CLIENT_ID,
          redirect_uri: process.env.REACT_APP_TWITTER_REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const accessToken = data.access_token;

          // Fetch the user's Twitter ID using the access token
          fetch('https://api.twitter.com/2/users/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
            .then((response) => response.json())
            .then((userData) => {
              const identifier = `twitter_${userData.data.id}`; // Use Twitter ID as the unique identifier
              saveUserIdentifier(identifier);
            })
            .catch((error) => {
              console.error('Failed to fetch user data:', error);
            });
        })
        .catch((error) => {
          console.error('Failed to exchange code for access token:', error);
        });
    }
  }, []);

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
            <button
              onClick={handleTwitterLoginClick}
              style={{
                backgroundColor: '#1DA1F2',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                margin: '10px',
              }}
            >
              Login with Twitter
            </button>
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