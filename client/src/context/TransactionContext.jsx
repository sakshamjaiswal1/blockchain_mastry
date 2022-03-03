import React, { useEffect, useState } from "react";

import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionsContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(false);
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    if (!ethereum) return alert("Please Install Metamask");
    const transactionContract = getEthereumContract();
    const availableTransactions = await transactionContract.getAllTransaction();
    console.log(availableTransactions);
    const structuredTransactions = availableTransactions.map((transaction) => ({
      addressTo: transaction.receiver,
      addressFrom: transaction.sender,
      timeStamp: new Date(
        transaction.timestamp.toNumber() * 1000
      ).toLocaleString(),
      message: transaction.message,
      keyword: transaction.keyword,
      amount: parseInt(transaction.amount._hex) / 10 ** 18,
    }));
    console.log(structuredTransactions);
    setTransactions(structuredTransactions);
  };
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        return alert("Please Install Metamask");
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
        console.log(accounts);
      } else {
        console.log("no accounts found");
      }
    } catch (error) {
      console.log(err);
      throw new Error("No etherium object");
    }
  };

  const checkIfTransactionExists = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionsCount = await transactionContract.getTransactionCount();
      window.localStorage.setItem("transactionsCount", transactionsCount);
    } catch (error) {
      console.log(err);
      throw new Error("No etherium object");
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) {
        return alert("Please Install Metamask");
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      console.log(currentAccount, "ddd");
    } catch (err) {
      console.log(err);
      throw new Error("No etherium object");
    }
  };
  const sendTransaction = async () => {
    try {
      if (!ethereum) {
        return alert("Please Install Metamask");
      }
      // console.log('ddd')
      const { addressTo, amount, keyword, message } = formData;
      console.log(formData);
      const transactionContract = getEthereumContract();
      const pasredAmount = ethers.utils.parseEther(amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: pasredAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        pasredAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionsCount = await transactionContract.getTransactionCount();

      setTransactionCount(transactionsCount.toNumber());
    } catch (error) {
      console.log(error);
      throw new Error("No etherium object");
    }
  };
  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionExists();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isloading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
