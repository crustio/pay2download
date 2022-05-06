import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import axios from 'axios';
import { connect } from "react-redux";
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material';
import cardImg from '../../assets/card-background.png';
import buttonImg from '../../assets/button.png';
import { useParams } from "react-router-dom";
import LoadingOverlay from 'react-loading-overlay-ts';
import { decryptFile } from '../../utils/encrypt';
import { saveAs } from 'file-saver';
import Web3 from 'web3';
import { setIsLoading, setGlobalPrivateKey } from '../../redux/actions/AccountActions';

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

const StyledLoader = styled(LoadingOverlay)`
  height: 100%;
`

const BuyFiles = (props) => {
  const { accountAddress, signature, isLoggedIn, setIsLoading, globalPrivateKey, setGlobalPrivateKey } = props;
  const classes = useStyles();
  const [success, setSuccess] = useState(false); // Success for file purchase.
  const [loading, setLoading] = useState(false); 
  const [name, setName] = useState(); // File name.
  const [numberOfFiles, setNumberOfFiles] = useState(); // Number of files.
  const [size, setSize] = useState(); // File size.
  const [price, setPrice] = useState(); // File Price.
  const [fileExist, setFileExist] = useState(true); // Condition variable for file existance.
  const [fileCid, setFileCid] = useState(); // Cid of file to down.
  const [sellerAddress, setSellerAddress] = useState(); // File seller's Metamask address.
  const [transactionHash, setTransactionHash] = useState(); // Hash for transaction to buy files.
  const [privateKey, setPrivateKey] = useState(globalPrivateKey);
  const [errorMessage, setErrorMessage] = useState();
  let { shortlink } = useParams();

  useEffect(async () => {
    if(accountAddress && signature && accountAddress.length > 0) {
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
          setName(result.data.data.name);
          setPrice(result.data.data.price);
          setSellerAddress(result.data.data.payment_address);
          setFileCid(result.data.data.cid);
          setFileExist(true);
          setSize(result.data.data.options.size);
          setNumberOfFiles(result.data.data.options.count);
        }
        else {
          setFileExist(false);
        }
      }).catch(error => {
        setFileExist(false);
      });
    }
  }, [accountAddress, signature]);

  useEffect(async () => {
    if(transactionHash) {
      const perSignData = `eth-${accountAddress}:${signature}`;
      const base64Signature = window.btoa(perSignData);
      const AuthBearer = `Bearer ${base64Signature}`;
  
      axios.request({
        data: {
          cid: fileCid,
          hash: transactionHash
        },
        headers: { Authorization: AuthBearer },
        method: 'post',
        url: `https://p2d.crustcode.com/api/v1/buyFile`
      }).then(result => {
        if(result.data) {
          if(result.data.data.status === true && result.data.data.result === 'success') {
            getPrivateKey();
          }
        }
        else {
          setLoading(false);
          setIsLoading(false);
        }
      }).catch(error => {
        setLoading(false);
        setIsLoading(false);
      });
    }
  }, [transactionHash]);

  useEffect(() => {
    if(privateKey) {
      setSuccess(true);
      setLoading(false);
      setIsLoading(false);
    }
  }, [privateKey]);

  const clickPayButton = async () => {
    if(accountAddress && signature) {
      const web3 = new Web3(window.ethereum);
      const sendTransaction = () => {
        web3.eth.sendTransaction({
          from: accountAddress,
          to: sellerAddress,
          value: Web3.utils.toWei(price.toString(), 'ether'),
        })
        .on('transactionHash', function(hash){
        })
        .on('receipt', function(receipt){
        })
        .on('confirmation', function(confirmationNumber, receipt){ 
          setTransactionHash(receipt.transactionHash);
        })
        .on('error', function(error) { setLoading(false); setIsLoading(false); });
      }

      setLoading(true);
      setIsLoading(true);

      if(isLoggedIn) {
        if(window.ethereum.networkVersion === '1') {
          sendTransaction();
        }
        else {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: web3.utils.toHex(1) }]
            })
            .then((res) => sendTransaction())
            .catch((err) => {
              setLoading(false);
              setIsLoading(false);
            });
          } catch (err) {
          }
        }
      }
      else {
        setLoading(false);
        setIsLoading(false);
      }
    }
  }

  const getPrivateKey = async () => {
    const perSignData = `eth-${accountAddress}:${signature}`;
    const base64Signature = window.btoa(perSignData);
    const AuthBearer = `Bearer ${base64Signature}`;

    await axios.request({
      headers: { Authorization: AuthBearer },
      method: 'get',
      url: `https://p2d.crustcode.com/api/v1/download/${fileCid}`
    }).then(result => {
      if(result.data.data.status === true) {
        setSuccess(true);
        setLoading(false);
        setIsLoading(false);
        setPrivateKey(result.data.data.result.private_key);
      }
    }).catch(error => {
      setErrorMessage('Error occurred during private key');
    });
  }

  const decryptAndDownload = async () => {
    setLoading(true);
    setIsLoading(true);
    const res = await axios.get(`${process.env.REACT_APP_IPFS_ENDPOINT}/ipfs/${fileCid}?filename=${name}`, { responseType: "arraybuffer" });
    const decryptData = await decryptFile(res.data, privateKey);
    const saveFile = new File([decryptData], name, { type: res.headers['content-type'] });
    saveAs(saveFile, name);
    setLoading(false);
    setIsLoading(false);
    setGlobalPrivateKey(null);
  }

  return (
    <div className={classes.container}>
      <StyledLoader
          active={loading}
          spinner
          style={{
            wrapper: {
              width: '100%',
              height: '100%'
            }
          }}
        >
        <div className={classes.card}>
          {
            isLoggedIn 
            ? 
            <React.Fragment>
              {signature ? <React.Fragment>
                {fileExist === true ? <div>
                    <h2>{name}</h2>
                    <p>{numberOfFiles} Files, {size}, {price < 0.00001 ? parseFloat(price) : price} ETH</p>
                    {loading && !success && <p className={classes.msg}>Payment process, please don't close and refresh the page</p>}
                    <Button 
                      className={loading === false ? classes.imgButton : classes.imgButtonDisabled} 
                      onClick={() => success ? decryptAndDownload() : clickPayButton()} 
                      disabled={loading}>
                        {success ? 'Download' : `Pay ${price < 0.00001 ? parseFloat(price) : price} ETH`}
                    </Button>
                </div> : 
                <div>
                  <h2>File Does not exist.</h2>
                </div>}
                </React.Fragment> 
                :
                <div>
                  <h2>You didn't sign from Metamask. Please check Metamask or refresh page.</h2>
                </div>
              }
            </React.Fragment>
            : <div>
                <h2>You are not logged into Metamask. Please login first.</h2>
              </div>
          }
        </div>
      </StyledLoader>
    </div>
  );
};

const mapStateToProps = state => ({
  accountAddress: state.account.address,
  signature: state.account.signature,
  isLoggedIn: state.account.isLoggedIn,
  globalPrivateKey: state.account.globalPrivateKey,
});

export default connect(mapStateToProps, { setIsLoading, setGlobalPrivateKey })(BuyFiles);