# Wallet with Google OAuth2

This project demonstrates how to create an Ethereum wallet using Google OAuth2 for authentication. The wallet is generated deterministically based on the user's Google OAuth `sub` (unique identifier), ensuring the same wallet is always generated for the same user.

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A [Google Cloud Platform (GCP)](https://console.cloud.google.com/) account to set up OAuth2 credentials


### 1. Clone the Repository

Clone this repository to your local machine:

### 2. Install Dependencies
Install the required dependencies using npm:
```
npm install
```
### 3. Set Up Google OAuth2 Credentials
Go to the Google Cloud Console:

Navigate to the Google Cloud Console.

Create a New Project:

Click on the project dropdown at the top of the page.

Select New Project and follow the prompts to create a new project.

Enable the Google OAuth2 API:

In the left sidebar, go to APIs & Services > Library.

Search for "Google OAuth2 API" and enable it.

Create OAuth2 Credentials:

Go to APIs & Services > Credentials.

Click on Create Credentials and select OAuth 2.0 Client IDs.

Choose Web Application as the application type.

Under Authorized JavaScript origins, add http://localhost:3000.

Under Authorized redirect URIs, add http://localhost:3000.

Click Create.

Get Your Client ID:

After creating the OAuth2 credentials, you will see a Client ID. Copy this value.

Set Up Environment Variables:

Create a .env file in the root of your project:

```
bash Copy touch .env
```

Add the following line to the .env file, replacing YOUR_GOOGLE_CLIENT_ID with the Client ID you copied:
```
env Copy REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```
### 4. Run the Application
Start the development server:
```
npm start
```
The application will be available at http://localhost:3000.

## How It Works
Login with Google:

Click the "Login with Google" button to authenticate using your Google account.

Generate Wallet:

Upon successful login, a deterministic Ethereum wallet is generated based on your Google OAuth sub.

View Wallet Address:

Once logged in, your Ethereum wallet address will be displayed.

Send Transaction:

Click the "Send Transaction" button to send a test transaction (0.01 ETH) to a predefined address.

Logout:

Click the "Logout" button to clear your session and wallet.


### Dependencies
```
React: Frontend library.

ethers.js: Ethereum wallet and transaction handling.

@react-oauth/google: Google OAuth2 integration.
```
### Troubleshooting
1. Invalid Google Client ID
Ensure the REACT_APP_GOOGLE_CLIENT_ID in .env matches the Client ID from your Google Cloud Console.

Make sure the authorized JavaScript origins and redirect URIs are correctly set to http://localhost:3000.

2. Transaction Errors
Ensure you have a valid Infura Project ID in the sendTransaction function.

Make sure the wallet has sufficient funds to send the transaction.

3. Environment Variables Not Loading
Restart the development server after adding or modifying the .env file.


