import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connect } from "react-redux";
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material';
import cardImg from '../../assets/card-background.png';
import buttonImg from '../../assets/button.png';
import { useParams } from "react-router-dom";
import Web3 from 'web3';
import { decryptFile } from '../../utils/encrypt';
import { saveAs } from 'file-saver';

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
  const [step, setStep] = useState(1); // step for file purchase.
  const [loading, setLoading] = useState(false); 
  const [name, setName] = useState(); // File name.
  const [numberOfFiles, setNumberOfFiles] = useState(); // Number of files.
  const [size, setSize] = useState(); // File size.
  const [price, setPrice] = useState(); // File Price.
  const [fileExist, setFileExist] = useState(true); // Condition variable for file existance.
  const [fileCid, setFileCid] = useState(); // Cid of file to down.
  const [sellerAddress, setSellerAddress] = useState(); // File seller's Metamask address.
  const [transactionHash, setTransactionHash] = useState(); // Hash for transaction to buy files.
  const [privateKey, setPrivateKey] = useState(); // Private Key to decrypt file.
  let { shortlink } = useParams();
  const { accountAddress, signature } = props;

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
          if(result.data.data.status === true) {
            setPrivateKey(result.data.data.result.private_key);
            setStep(step+1);
            setLoading(false);
          }
        }
        else {
          setLoading(false);
        }
      }).catch(error => {
        setLoading(false);
      });
    }
  }, [transactionHash])

  const clickPayButton = async () => {
    if(accountAddress && signature) {
      setLoading(true);

      const web3 = new Web3(window.ethereum);

      web3.eth.sendTransaction({
        from: accountAddress,
        to: sellerAddress,
        value: Web3.utils.toWei(price.toString(), 'ether'),
        chainId: '0x4'
      })
      .on('transactionHash', function(hash){
      })
      .on('receipt', function(receipt){
      })
      .on('confirmation', function(confirmationNumber, receipt){ 
        setTransactionHash(receipt.transactionHash);
      })
      .on('error', function(error) { setLoading(false) });
    }
  }

  const decryptAndDownload = async (privateKey) => {
    const res = await axios.get(`${process.env.REACT_APP_IPFS_ENDPOINT}/ipfs/${fileCid}?filename=${name}`, { responseType: "arraybuffer" });
    const decryptData = await decryptFile(res.data, privateKey);
    const saveFile = new File([decryptData], name, { type: res.headers['content-type'] });
    saveAs(saveFile, name);
  }

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        {signature ? <React.Fragment>
          {fileExist === true ? <div>
              <h2>{name}</h2>
              <p>{numberOfFiles} Files, {size}, {price} ETH</p>
              {loading && <p className={classes.msg}>Payment Processing... Please Wait</p>}
              <Button 
                className={loading === false ? classes.imgButton : classes.imgButtonDisabled} 
                onClick={() => {
                  if(step === 1) {
                    clickPayButton()
                  }
                  else {
                    decryptAndDownload(privateKey);
                  }
                }} 
                disabled={loading}>
                  {step === 1 ? `Pay ${price} ETH` : 'Download'}
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
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  accountAddress: state.account.address,
  signature: state.account.signature
});

export default connect(mapStateToProps, {  })(BuyFiles);