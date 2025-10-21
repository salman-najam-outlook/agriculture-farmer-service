import { ethers } from "ethers";

const {
  contractABI,
  contractAddress,
  contractProvider,
  CONTRACT_NEWTORK,
  INFURA_API_KEY,
  OWNER_PRIVATE_KEY,
  OWNER_PUBLIC_KEY,
  JSON_RPC_URL,
  COMMITTERS_PUBLIC_KEY,
  COMMITTERS_PRIVATE_KEY,
} = require("./contract-config");

let _infuraProvider = null,
  _provider = null,
  _etherContract = null,
  _walletSigner = null;

export const getInfuraProvider = () => {
  if (_infuraProvider) return _infuraProvider;
  _infuraProvider = new ethers.providers.InfuraProvider(
    CONTRACT_NEWTORK,
    INFURA_API_KEY
  );
  return _infuraProvider;
};

export const getProvider = () => {
  if (_provider) return _provider;
  _provider = new ethers.providers.JsonRpcProvider(JSON_RPC_URL);
  return _provider;
};

export const getFeeData = async () => {
  const provider = getProvider();

  const feeData = await provider.getFeeData();
  // Convert hex values to BigNumber objects
  const gasPrice = ethers.BigNumber.from(feeData.gasPrice._hex);
  const gasLimit = ethers.utils.parseUnits("100000000", "gwei"); //0.1 matic

  return { gasPrice, gasLimit };
};

export const getWallet = () => {
  if (_walletSigner) return _walletSigner;
  const provider = getProvider();
  _walletSigner = new ethers.Wallet(COMMITTERS_PRIVATE_KEY, provider);
  return _walletSigner;
};

export const getBalance = async (walletPublicKey: string) => {
  const provider = getProvider();
  const balance = await provider.getBalance(walletPublicKey);
  return ethers.utils.formatEther(balance._hex).toString();
};

export const getTransactionCount = async () => {
  const provider = getProvider();
  const transacationCount = await provider.getTransactionCount(
    COMMITTERS_PUBLIC_KEY
  );
  return transacationCount;
};

export const checkIfHasExistsInChain = async (txHash: string) => {
  try {
    const provider = getProvider();

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);

    if (receipt) {
      // Transaction exists
      console.log("Transaction exists on the blockchain.");
      console.log("Receipt:", receipt);

      return true;
    } else {
      // Transaction does not exist
      console.log("Transaction does not exist on the blockchain.");
      return false;
    }
  } catch (err) {
    console.error("Error occurred while checking transaction:", err);
    return false;
  }
};

export const initializeEtherContract = async () => {
  try {
    if (_etherContract) return _etherContract;

    const signer = await getWallet();
    _etherContract = new ethers.Contract(contractAddress, contractABI, signer);
    return _etherContract;
  } catch (e) {
    console.log("Error initializing contract", e);
    throw new Error("Error initializing contract");
  }
};
