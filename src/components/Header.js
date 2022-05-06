import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import logo from '../assets/logo.png';
import styled from 'styled-components';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import buttonImg from '../assets/button_third.png';
import { connect } from "react-redux";
import { setAccountAddress, setAccountSignature, setIsLoggedIn } from '../redux/actions/AccountActions';
import PropTypes from 'prop-types';
import { sign } from '../utils/sign';

const HeaderBar = styled.header`
  width: 100%;
  padding: 0.5em 2em;
  display: flex;
  height: 64px;
  position: fixed;
  align-items: center;
  background-color: #FF8D00;
  z-index: 1;
  justify-content: space-between;
`;

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center'
  },
  imgButton: {
    backgroundImage: `url(${buttonImg})`, 
    backgroundRepeat: 'no-repeat', 
    backgroundSize: 'contain',
    width: 150,
    height: 40,
    color: 'black !important',
    textTransform: 'none !important',
    marginRight: '4rem !important',
    marginLeft: '-2rem !important'
  },
}));

const Header = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { setAccountAddress, setAccountSignature, setIsLoggedIn, accountAddress, isLoading, isLoggedIn } = props;
  
  useEffect(async () => {
    if(window.ethereum) {
      const storedSignature = localStorage.getItem('signature');
      if(storedSignature) {
        await setAccountSignature(storedSignature);
      }

      const storedAddress = localStorage.getItem('address');
      if(storedAddress) {
        await setAccountAddress(storedAddress);
      }
      else {
        window.ethereum
        .request({ method: 'eth_accounts' })
        .then(async (res) => {
          if(res.length === 0) history.push('/');
          else {
            setAccountAddress(res[0]);
            updateSignature(res[0]);
            localStorage.setItem('address', res[0]);
          }
        })
        .catch(console.error);
      }

      window.ethereum.on('accountsChanged', (accounts) => {
        if(localStorage.getItem('address') !== accounts[0] && !document.hidden) {
          localStorage.setItem('address', accounts[0]);
          localStorage.removeItem('signature');
          setAccountSignature(null);
          setAccountAddress(accounts[0]);
        }
      });
    }
    else {
      history.push('/');
    }
  }, []);

  useEffect(async () => {
    const storedSignature = localStorage.getItem('signature');
    if(accountAddress && accountAddress.length > 0 && !storedSignature) {
      updateSignature(accountAddress);
    }
  }, [accountAddress]);

  const disconnect = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('signature');
    history.push('/');
  }

  const shortenAddress = address => address && address.length > 0 && isLoggedIn ? `${address.slice(0, 6)}...${address.substr(address.length - 8)}` : '';

  const updateSignature = async (address) => {
    const signature = await sign(address, address);
    localStorage.setItem('signature', signature);
    setAccountSignature(signature);
    setIsLoggedIn(true);
  }

  return (
    <HeaderBar>
      <div className={classes.container}>
        <div>
            <img src={logo} alt="Xcelvations Logo" height="40" />
        </div>
        <div>
            <p style={{fontSize: 20, fontWeight: 500, margin: '0px 0px 0px 10px' }}>Hello</p>
            <p style={{fontSize: 15, fontWeight: 500, margin: '0px 0px 0px 10px' }}>{shortenAddress(accountAddress)}</p>
        </div>
      </div>
      <div className={classes.container}>
        <Button className={classes.imgButton} onClick={() => history.push('/my-account')} disabled={isLoading} >My Account</Button>
        <Button className={classes.imgButton} onClick={() => disconnect()} disabled={isLoading} >Disconnect</Button>
      </div>
    </HeaderBar>
  );
};

const mapStateToProps = state => ({
  accountAddress: state.account.address,
  isLoading: state.account.isLoading,
  isLoggedIn: state.account.isLoggedIn,
  setAccountAddress: PropTypes.func.isRequired,
  setAccountSignature: PropTypes.func.isRequired,
});

export default connect(mapStateToProps, { setAccountAddress, setAccountSignature, setIsLoggedIn })(Header);