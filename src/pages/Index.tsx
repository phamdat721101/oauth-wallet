import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ethers } from 'ethers';
import { WalletCard } from '../components/WalletCard';
import { LoginScreen } from '../components/LoginScreen';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { generateRandomString, generateCodeChallenge } from '../utils/auth';

const Index = () => {
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);

  useEffect(() => {
    const storedIdentifier = localStorage.getItem('userIdentifier');
    if (storedIdentifier) {
      setUserIdentifier(storedIdentifier);
      generateWallet(storedIdentifier);
    }
  }, []);

  const generateWallet = (identifier: string) => {
    try {
      const hash = ethers.sha256(ethers.toUtf8Bytes(identifier));
      const privateKey = hash;
      const newWallet = new ethers.Wallet(privateKey);
      setWallet(newWallet);
      console.log('Wallet generated:', newWallet.address);
    } catch (error) {
      console.error('Error generating wallet:', error);
      toast.error('Failed to generate wallet');
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse: any) => {
    try {
      const userInfo = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const identifier = `google_${userInfo.sub}`;
      saveUserIdentifier(identifier);
      toast.success('Google login successful!');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to process Google login');
    }
  };

  const handleGitHubLoginSuccess = (response: any) => {
    console.log("Github resp: ", response)
    try {
      if (response && response.code) {
        // GitHub returns a id that should be exchanged for an access token
        const identifier = `github_${response.code}`;
        saveUserIdentifier(identifier);
        toast.success('GitHub login successful!');
      } else {
        throw new Error('Invalid GitHub response');
      }
    } catch (error) {
      console.error('GitHub login error:', error);
      toast.error('Failed to process GitHub login');
    }
  };

  const handleGitHubLoginFailure = (error: any) => {
    console.error('GitHub Login Failed:', error);
    toast.error('GitHub login failed. Please try again.');
  };

  const handleTwitterLoginClick = async () => {
    try {
      const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_TWITTER_REDIRECT_URI;
      const scope = 'tweet.read users.read';
      const state = generateRandomString(16);
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store code verifier in localStorage for later use
      localStorage.setItem('twitter_code_verifier', codeVerifier);

      // Construct Twitter OAuth URL
      const twitterAuthUrl = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      
      console.log('Redirecting to Twitter Auth URL:', twitterAuthUrl);
      window.location.href = twitterAuthUrl;
    } catch (error) {
      console.error('Twitter auth error:', error);
      toast.error('Failed to initiate Twitter login');
    }
  };

  const handleMockLogin = () => {
    const mockIdentifier = `mock_${Date.now()}`;
    saveUserIdentifier(mockIdentifier);
    toast.success('Mock login successful!');
  };

  const saveUserIdentifier = (identifier: string) => {
    localStorage.setItem('userIdentifier', identifier);
    setUserIdentifier(identifier);
    generateWallet(identifier);
    toast.success('Wallet created successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('userIdentifier');
    setUserIdentifier(null);
    setWallet(null);
    toast.success('Logged out successfully');
  };

  const sendTransaction = async () => {
    if (!wallet) {
      toast.error('No wallet available');
      return;
    }

    try {
      // For demonstration purposes, we'll just show a success message
      toast.success('Transaction simulated successfully!');
      console.log('Transaction simulation for wallet:', wallet.address);
    } catch (error) {
      console.error('Error simulating transaction:', error);
      toast.error('Failed to simulate transaction');
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen bg-wallet-background">
        {!userIdentifier ? (
          <LoginScreen
            onGoogleSuccess={handleGoogleLoginSuccess}
            onGitHubSuccess={handleGitHubLoginSuccess}
            onGitHubFailure={handleGitHubLoginFailure}
            onTwitterClick={handleTwitterLoginClick}
            onMockLogin={handleMockLogin}
          />
        ) : (
          <div className="container mx-auto py-8 px-4 space-y-6">
            {wallet && <WalletCard address={wallet.address} />}
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={sendTransaction}
                className="bg-wallet-primary hover:bg-wallet-secondary text-white w-full max-w-md"
              >
                Simulate Transaction
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full max-w-md"
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Index;