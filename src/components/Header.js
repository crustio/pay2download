import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import logo from '../assets/logo.png';
import styled from 'styled-components';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import buttonImg from '../assets/button_third.png';

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

const Header = () => {
  const classes = useStyles();
  const history = useHistory();
  const [address, setAddress] = React.useState('');
  
  useEffect(() => {
    if(window.ethereum) {
      window.ethereum
      .request({ method: 'eth_accounts' })
      .then((res) => {
        if(res.length === 0) history.push('/');
        else setAddress(res[0])
      })
      .catch(console.error);
    }
    else {
      history.push('/');
    }
  });

  const disconnect = () => {
    
  }

  const shortenAddress = address => `${address.slice(0, 6)}...${address.substr(address.length - 8)}`;

  return (
    <HeaderBar>
      <div className={classes.container}>
        <div>
            <img src={logo} alt="Xcelvations Logo" height="40" />
        </div>
        <div>
            <p style={{fontSize: 20, fontWeight: 500, margin: '0px 0px 0px 10px' }}>Hello</p>
            <p style={{fontSize: 15, fontWeight: 500, margin: '0px 0px 0px 10px' }}>{shortenAddress(address)}</p>
        </div>
      </div>
      <div className={classes.container}>
        <Button className={classes.imgButton}>My Account</Button>
        <Button className={classes.imgButton} onClick={() => disconnect()}>Disconnect</Button>
      </div>
    </HeaderBar>
  );
};
export default Header;