import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
import { Button } from './ui/button';

interface LoginScreenProps {
  onGoogleSuccess: (response: any) => void;
  onGitHubSuccess: (response: any) => void;
  onGitHubFailure: (error: any) => void;
  onTwitterClick: () => void;
  onMockLogin?: () => void;
}

export const LoginScreen = ({
  onGoogleSuccess,
  onGitHubSuccess,
  onGitHubFailure,
  onTwitterClick,
  onMockLogin,
}: LoginScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-wallet-background p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-wallet-text">
          Welcome to Your Web3 Wallet
        </h1>
        <p className="text-center text-gray-600">
          Connect with your favorite social account to get started
        </p>
        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => console.error('Google Login Failed')}
            />
          </div>
          <div className="flex justify-center">
            <GitHubLogin
              clientId={import.meta.env.VITE_GITHUB_CLIENT_ID || ''}
              redirectUri={import.meta.env.VITE_GITHUB_REDIRECT_URI}
              onSuccess={onGitHubSuccess}
              onFailure={onGitHubFailure}
              buttonText="Login with GitHub"
              className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            />
          </div>
          <button
            onClick={onTwitterClick}
            className="w-full py-2 px-4 bg-[#1DA1F2] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#1a8cd8] transition-colors"
          >
            Login with Twitter
          </button>
          
          {/* Mock login button for testing */}
          <Button 
            onClick={onMockLogin}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Test Wallet (Mock Login)
          </Button>
        </div>
      </div>
    </div>
  );
};