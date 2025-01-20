import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
import { ethers } from 'ethers';

// Helper functions
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from({ length }, () => possible[Math.floor(Math.random() * possible.length)]).join('');
};

const base64URLEncode = (str) => {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hash);
};

const generateCodeChallenge = async (codeVerifier) => {
  const hashed = await sha256(codeVerifier);
  return base64URLEncode(hashed);
};

function App() {
  const [wallet, setWallet] = useState(null);
  const [userIdentifier, setUserIdentifier] = useState(null);

  useEffect(() => {
    const storedIdentifier = localStorage.getItem('userIdentifier');
    if (storedIdentifier) {
      setUserIdentifier(storedIdentifier);
      generateWallet(storedIdentifier);
    }
  }, []);

  const generateWallet = (identifier) => {
    const hash = ethers.sha256(ethers.toUtf8Bytes(identifier));
    const privateKey = hash;
    const newWallet = new ethers.Wallet(privateKey);
    setWallet(newWallet);
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const userInfo = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    const identifier = `google_${userInfo.sub}`;
    saveUserIdentifier(identifier);
  };

  const handleGitHubLoginSuccess = (response) => {
    const identifier = `github_${response.id}`;
    saveUserIdentifier(identifier);
  };

  const handleGitHubLoginFailure = (error) => {
    console.error('GitHub Login Failed:', error);
  };

  const handleTwitterLoginClick = async () => {
    const clientId = process.env.REACT_APP_TWITTER_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_TWITTER_REDIRECT_URI);
    const scope = encodeURIComponent('tweet.read users.read');
    const state = generateRandomString(16);
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('twitter_code_verifier', codeVerifier);

    const twitterAuthUrl = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    console.log('Redirecting to Twitter Auth URL:', twitterAuthUrl);
    window.location.href = twitterAuthUrl;
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    if (code) {
      const code_verifier = localStorage.getItem('twitter_code_verifier');

      // Use `no-cors` mode to bypass CORS restrictions
      fetch('https://api.x.com/2/oauth2/token', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: process.env.REACT_APP_TWITTER_CLIENT_ID,
          redirect_uri: process.env.REACT_APP_TWITTER_REDIRECT_URI,
          code_verifier,
        }),
      })
        .then((response) => {
          // Note: You cannot access the response data directly in `no-cors` mode
          console.log('Token exchange response:', response);

          // Manually inspect the response using browser dev tools
          // If the token exchange is successful, set the access token
          const accessToken = 'YOUR_ACCESS_TOKEN'; // Replace with the actual access token from the response
          fetchUserData(response.access_token);
        })
        .catch((error) => {
          console.error('Failed to exchange code for access token:', error);
        });
    }
  }, []);

  const fetchUserData = (accessToken) => {    
    // Use `no-cors` mode to bypass CORS restrictions
    fetch('https://api.x.com/2/users/me', {
      method: 'GET',
      mode: 'no-cors', // Bypass CORS restrictions
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        // Note: You cannot access the response data directly in `no-cors` mode
        console.log('User data response:', response);

        // Manually inspect the response using browser dev tools
        // If the user data fetch is successful, set the user identifier
        const identifier = `twitter_${response.access_token}`; // Use a unique identifier
        saveUserIdentifier(identifier);
      })
      .catch((error) => {
        console.error('Failed to fetch user data:', error);
      });
  };

  const saveUserIdentifier = (identifier) => {
    localStorage.setItem('userIdentifier', identifier);
    setUserIdentifier(identifier);
    generateWallet(identifier);
  };

  const handleLogout = () => {
    localStorage.removeItem('userIdentifier');
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
      value: ethers.parseEther('0.01'),
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