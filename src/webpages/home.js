import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import connectButton from '../assets/connect-button.png';
import Web3 from "web3";

const Home = () => {
  const history = useHistory();
  const [web3, setWeb3] = React.useState();
  const [isMetaMask, setIsMetaMask] = React.useState(true);
  const [address, setAddress] = React.useState();
  
  useEffect(() => {
    if(window.ethereum) {
      if(localStorage.getItem('address')) {
        window.ethereum
        .request({ method: 'eth_accounts' })
        .then((res) => {
          if(res.length > 0) history.push('/sell-my-files');
        })
        .catch(console.error);
      }
    }
    else {
      setIsMetaMask(false);
    }
  });

  useEffect(() => {
    if(web3 && address) { history.push('/sell-my-files') };
  }, [web3, address]);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      const web3Obj = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        setWeb3(web3Obj);
      } catch (error) {
      }

      window.ethereum
      .request({ method: 'eth_accounts' })
      .then(async (res) => {
        if(res.length === 0) history.push('/');
        else {
          localStorage.setItem('address', res[0]);
          setAddress(res[0]);
        }
      })
      .catch(console.error);
    }
    else if (window.web3) {
      const web3Obj = window.web3;
      setWeb3(web3Obj);
    }
    else {
      const provider = new Web3.providers.HttpProvider(
        `https://mainnet.infura.io/v3/ff7cb837065f48009f1e3b2039f50df3`
      );
      const web3Obj = new Web3(provider);
      setWeb3(web3Obj);
    }
  }

  return (
    <div style={{textAlign: 'center', paddingTop: '8rem'}}>
      {isMetaMask ? 
      <img src={connectButton} style={{width: '30%', cursor: 'pointer'}} alt="" onClick={() => connectMetaMask()} /> 
      : 
      <h2>You have not installed MetaMask yet. <a href="https://metamask.io/" target="_blank" rel="noreferrer">Click here</a> to Install MetaMask.</h2>}
    </div>
  );
};
export default Home;