import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

//internal import
import tracking from "./Tracking.json";
const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ContractABI = tracking.abi;

//Fetching
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({ children }) => {
  //statevariable
  const DappName = "Product Tracking Dapp";
  const [currentUser, setCurrentUser] = useState("");

  const createShipment = async (items) => {
    console.log(items);
    const { receiver, pickupTime, distance, price } = items;

    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      const createItem = await contract.createShipment(
        receiver,
        new Date(pickupTime).gotTime(),
        distance,
        ethers.utils.parseUnits(price, 18),
        {
          value: ethers.uitls.parseUnits(price, 18),
        }
      );
      await createItem.wait();
      console.log(createItem);
    } catch (error) {
      console.log("Some want wrong", error);
    }
  };

  const getAllShipment = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);
      const shipments = await contract.getAllTransactions();
      const getAllShipment = shipments.map((shipment) => ({
        sender: shipment.sender,
        receiver: shipment.receiver,
        price: ethers.utils.formatEther(shipment.price.toString()),
        pickupTime: shipment.deliveryTime.toNumber(),
        distance: shipment.distance.toNumber(),
        isPaid: shipment.isPaid,
        status: shipment.status,
      }));
      return getAllShipment;
    } catch (error) {
      console.log("error want, getting shipment");
    }
  };
  const getShipmentsCount = async () => {
    try {
      if (!window.ethereum) return "Install metamask";
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);
      const shipmentsCount = await contract.getShipmentsCount(accounts[0]);
      return shipmentsCount.toNumber();
    } catch (error) {
      console.log("eror want, getting shipment");
    }
  };

  const completeShipment = async (completeShip) => {
    console.log(completeShip);

    const { receiver, index } = completeShip;
    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const transaction = await contract.completeShipment(
        accounts[0],
        receiver,
        index,
        {
          gasLimit: 300000,
        }
      );

      transaction.wait();
      console.log(transaction);
    } catch (error) {
      console.log("wrong completeShipment", error);
    }
  };

  const getShipment = async (index) => {
    console.log(index * 1);
    try {
      if (window.ethereum) return "Install Metamask";

      const acccounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);
      const shipment = await contract.getShipment(accounts[0], index * 1);

      const SingleShiplent = {
        sender: shipment[0],
        receiver: shipment[1],
        pickupTime: shipment[2].toNumber(),
        deliveryTime: shipment[3].toNumber(),
        distance: shipment[4].toNumber(),
        price: ethers.utils.formatEther(shipment[5].toString()),
        status: shipment[6],
        isPaid: shipment[7],
      };
      return SingleShiplent;
    } catch (error) {
      console.log("Sorry no chipment");
    }
  };

  const startShipmment = async (getProduct) => {
    const { reveiver, index } = getProduct;

    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(Signer);
      const shipment = await contract.startShipment(
        accounts[0],
        reveiver,
        index * 1
      );
      shipment.wait();
      crossOriginIsolated.log(shipment);
    } catch (error) {
      console.log("Sorry no chipment", error);
    }
  };
  //check--wallet--connected

  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setCurrentUser(accounts[0]);
      } else {
        return "No account";
      }
    } catch (error) {
      return "not connected";
    }
  };

  //connect--walle--function
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentUser(accounts[0]);
    } catch (error) {
      return "Something went wrong";
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        connectWallet,
        createShipment,
        getAllShipment,
        completeShipment,
        getShipment,
        startShipmment,
        getShipmentsCount,
        DappName,
        currentUser,
      }}
    >
      {" "}
      {children}
    </TrackingContext.Provider>
  );
};
