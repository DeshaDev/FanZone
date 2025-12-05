import { Transaction, InteractionType } from "../types";
import { ethers } from "ethers";

const CELO_ALFAJORES_PARAMS = {
  chainId: '0xaef3', // 44787
  chainName: 'Celo Alfajores Testnet',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
  blockExplorerUrls: ['https://alfajores.celoscan.io/']
};

// Must match the Admin Address in App.tsx for the demo to work
const DEMO_ADMIN_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d89A23";

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.JsonRpcSigner | null = null;

const generateFakeHash = () => {
  return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

export const connectWallet = async (): Promise<{ address: string, balance: string, isDemo: boolean }> => {
  if (window.ethereum) {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      const address = accounts[0];

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CELO_ALFAJORES_PARAMS.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CELO_ALFAJORES_PARAMS],
          });
        }
      }

      const balanceBigInt = await provider.getBalance(address);
      const balance = ethers.formatEther(balanceBigInt);

      return {
        address: address,
        balance: `${parseFloat(balance).toFixed(2)} CELO`,
        isDemo: false
      };

    } catch (error) {
      console.warn("Connection failed or rejected:", error);
      throw new Error("Wallet connection failed"); 
    }
  }
  throw new Error("No Wallet Found");
};

export const connectWalletMock = async (): Promise<{ address: string, balance: string, isDemo: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        address: DEMO_ADMIN_ADDRESS, // Returns the admin address so you can see the panel
        balance: '15.4 CELO',
        isDemo: true
      });
    }, 800);
  });
};

export const registerUserOnChain = async (username: string, address: string): Promise<Transaction> => {
    const details = `REGISTER_USER:${username}`;
    return await recordInteraction(InteractionType.REGISTER, details, address);
};

export const recordInteraction = async (
  type: InteractionType,
  details: string,
  from: string
): Promise<Transaction> => {
  
  if (signer && window.ethereum && !from.includes("0x71C7")) { // Don't use signer for the fake demo address
    try {
      const utf8Encode = new TextEncoder();
      const hexData = '0x' + Array.from(utf8Encode.encode(details)).map(b => b.toString(16).padStart(2, '0')).join('');

      const txResponse = await signer.sendTransaction({
        to: from,
        value: 0,
        data: hexData
      });

      return {
        hash: txResponse.hash,
        from,
        type,
        details,
        timestamp: Date.now(),
        blockNumber: 0
      };

    } catch (error) {
      console.error("Transaction failed", error);
      throw error;
    }
  }

  // Mock Fallback
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    hash: generateFakeHash(),
    from,
    type,
    details,
    timestamp: Date.now(),
    blockNumber: Math.floor(Math.random() * 1000000) + 12000000
  };
};