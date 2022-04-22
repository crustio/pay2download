import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connect } from "react-redux";
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material';
import cardImg from '../../assets/card-background.png';
import buttonImg from '../../assets/button.png';
import { useParams } from "react-router-dom";
import Web3 from 'web3';

const useStyles = makeStyles(theme => ({
  container: {
    margin: '2rem',
    height: '90%'
  },
  card: {
    backgroundImage: `url(${cardImg})`, 
    backgroundRepeat: 'no-repeat', 
    backgroundSize: '100% 100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  imgButton: {
    backgroundImage: `url(${buttonImg})`, 
    backgroundRepeat: 'no-repeat', 
    backgroundSize: 'contain',
    width: 300,
    height: 70,
    fontSize: '25px !important',
    color: 'white !important',
    fontWeight: '600 !important',
    textTransform: 'none !important',
  },
  imgButtonDisabled: {
    backgroundImage: `url(${buttonImg})`, 
    backgroundRepeat: 'no-repeat', 
    backgroundSize: 'contain',
    width: 300,
    height: 70,
    fontSize: '25px !important',
    color: 'rgba(255,255,255, 0.5) !important',
    fontWeight: '600 !important',
    textTransform: 'none !important',
  },
  msg: {
    color: 'red'
  }
}));

const BuyFiles = (props) => {
  const classes = useStyles();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState();
  const [numberOfFiles, setNumberOfFiles] = useState();
  const [size, setSize] = useState();
  const [price, setPrice] = useState();
  const [fileExist, setFileExist] = useState(true);
  const [fileCid, setFileCid] = useState();
  const [sellerAddress, setSellerAddress] = useState();
  let { shortlink } = useParams();
  const { accountAddress, signature } = props;

  useEffect(async () => {
    if(accountAddress && signature) {
      // const signature = await sign(accountAddress, accountAddress);
      const perSignData = `eth-${accountAddress}:${signature}`;
      const base64Signature = window.btoa(perSignData);
      const AuthBearer = `Bearer ${base64Signature}`;
      
      await axios.request({
        headers: { Authorization: AuthBearer },
        method: 'get',
        url: `https://p2d.crustcode.com/api/v1/shortLink/${shortlink}`
      }).then(result => {
        if(result.data.data.name) {
          console.log(result.data);
          setName(result.data.data.name);
          setPrice(result.data.data.price);
          setSellerAddress(result.data.data.seller);
          setFileCid(result.data.data.cid);
          setFileExist(true);
        }
        else {
          setFileExist(false);
        }
      }).catch(error => {
        setFileExist(false);
      });
    }
  }, [accountAddress, signature]);

  const clickPayButton = async () => {
    const value = 0.0006
    const hexValue = Number(Web3.utils.toWei(value.toString(), 'ether')).toString(16);
    const transactionParameters = {
      nonce: '0x00',
      to: sellerAddress,
      from: accountAddress,
      value: `0x${hexValue}`,
      chainId: '0x4',
    };

    window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    }).then(hash => {
      console.log(hash, 'tx hash');
      const perSignData = `eth-${accountAddress}:${signature}`;
      const base64Signature = window.btoa(perSignData);
      const AuthBearer = `Bearer ${base64Signature}`;

      axios.request({
        data: {
          cid: fileCid,
          hash: hash
        },
        headers: { Authorization: AuthBearer },
        method: 'post',
        url: `https://p2d.crustcode.com/api/v1/buyFile`
      }).then(result => {
        if(result.data) {
          console.log(result.data, 'buy file');
        }
        else {
        }
      }).catch(error => {
      });
    }).catch(error => {
      
    });
  }

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        {fileExist === true ? <div>
            <h2>{name}</h2>
            <p>{numberOfFiles} Files, {size}GB, {price}ETH</p>
            {loading && <p className={classes.msg}>Payment Processing... Please Wait</p>}
            <Button 
              className={loading === false ? classes.imgButton : classes.imgButtonDisabled} 
              onClick={() => {
                if(step === 1) {
                  clickPayButton()
                }
              }} 
              disabled={loading}>
                {step === 1 ? `Pay ${price} ETH` : 'Download'}
            </Button> 
        </div> : 
        <div>
          <h2>File Does not exist.</h2>
        </div>}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  accountAddress: state.account.address,
  signature: state.account.signature
});

export default connect(mapStateToProps, {  })(BuyFiles);