import React from 'react';
import axios from 'axios';
import { makeStyles } from '@mui/styles';
import { Button, Grid, OutlinedInput, TextField } from '@mui/material';
import buttonImg from '../../assets/button.png';
import { connect } from "react-redux";
import JSZip from 'jszip';
import { encryptFile, readFileAsync } from '../../utils/encrypt';
import {Cypher} from "@zheeno/mnemonic-cypher";

const WordsCount = 8

const useStyles = makeStyles(theme => ({
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
  }));

const SecondStep = (props) => {
  const classes = useStyles();
  const [itemName, setItemName] = React.useState('');
  const [price, setPrice] = React.useState(0);
  const [isSubmit, setSubmit] = React.useState(false);
  const {
    accountAddress,
    signature,
    fileList,
    step,
    sizeErrorMessage,
    setCancel,
    setUpState,
    setShareLink,
    setErrorMessage,
    setSizeErrorMessage,
    setStep
  } = props;

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const handleClickUpload = async (event) => {
    setSubmit(true);

    if (itemName && price && price > 0) {
      let totalSize = 0;
      for(let i=0; i<fileList.length; i++) {
        totalSize += fileList[i].size;
      }
      if(totalSize < 1000000000)
      {
        if(fileList.length === 1) {
          const cypher = new Cypher(WordsCount);
          const {secret, mnemonics} = cypher.genMnemonics();
          const fileData = await readFileAsync(fileList[0]);
          const encryptedData = await encryptFile(fileData, window.btoa(secret));
          const encryptedFile = new Blob([encryptedData], { type: fileList[0].type });
  
          const form = new FormData();
          const fileNameSplitArray = fileList[0].name.split('.');
          const fileExtension = fileNameSplitArray[fileNameSplitArray.length - 1];
          form.append('file', encryptedFile, `${itemName}.${fileExtension}`);
  
          setStep(step+1);
          await pinToIPFS(form, secret);
        }
        else {
          // Compose all files into a folder
          let zip = new JSZip();
          var count = 0;
          fileList.forEach(function(file) {
            zip.file(file.name, file, {binary: true});
            count++;
            if (count === fileList.length) {
              zip.generateAsync({type:'blob'}).then(async (content) => {
                setStep(step+1); // Move to progress page.
                setUpState(0); // Set start progress 0.

                // Encrypt the file with public key
                const cypher = new Cypher(WordsCount);
                const {secret, mnemonics} = cypher.genMnemonics();
                const file = new Blob([content], { type: 'application/zip' });
                const fileData = await readFileAsync(file)
                const encryptedData = await encryptFile(fileData, window.btoa(secret));
                const encryptedFile = new Blob([encryptedData], { type: 'application/zip' });

                const form = new FormData();
                form.append('file', encryptedFile, `${itemName}.zip`);

                await pinToIPFS(form, secret);
              });
            }
          });
        }
      }
      else {
        setSizeErrorMessage('We can not upload files larger than 1GB!');
      }
    }
  }

  const pinToIPFS = async (form, secret) => {
    // Upload the folder to IPFS W3Auth GW -> single cid back
    const perSignData = `eth-${accountAddress}:${signature}`;
    const base64Signature = window.btoa(perSignData);
    const AuthBasic = `Basic ${base64Signature}`;
    const AuthBearer = `Bearer ${base64Signature}`;
    const cancel = axios.CancelToken.source();
    setCancel(cancel);

    const upResult = await axios.request({
        cancelToken: cancel.token,
        data: form,
        headers: { Authorization: AuthBasic },
        maxContentLength: 1024,
        method: 'POST',
        onUploadProgress: (p) => {
            const percent = p.loaded / p.total;
            setUpState(Math.round(percent * 99));
        },
        params: { pin: true },
        url: `${process.env.REACT_APP_IPFS_ENDPOINT}/api/v0/add`
    }).catch(error => {
      setErrorMessage('Error occurred during uploading!');
    });

    if(upResult?.status === 200) {
      let upRes;
      if (typeof upResult.data === 'string') {
        const jsonStr = upResult.data.replaceAll('}\n{', '},{');
        const items = JSON.parse(`[${jsonStr}]`);
        const folder = items.length - 1;

        upRes = items[folder];
        delete items[folder];
        upRes.items = items;
      } else {
          upRes = upResult.data;
      }

      // Call IPFS W3Auth pinning service
      const PinEndpoint = 'https://pin.crustcode.com';
      
      let resultApi = await axios.request({
          data: {
              cid: upRes.Hash,
              name: upRes.Name
          },
          headers: { Authorization: AuthBearer },
          method: 'POST',
          url: `${PinEndpoint}/psa/pins`
      }).catch(error => {
        setErrorMessage('Error occurred druing pinning cid!');
      });
      
      if(resultApi?.status === 200) {
        setUpState(99);
        // CALL API 1
        resultApi = await axios.request({
          data: {
              cid: upRes.Hash,
              price: price,
              name: upRes.Name,
              private_key: window.btoa(secret),
              options: {
                size: formatBytes(upRes.Size),
                count: fileList.length,
              }
          },
          headers: { Authorization: AuthBearer },
          method: 'POST',
          url: `https://p2d.crustcode.com/api/v1/calculateShortLinkHash`
        }).catch(error => {
          setErrorMessage('Error occurred during generate short hash link');
        });

        if(resultApi?.status === 200) {
          setShareLink(resultApi.data.data.result);
          setUpState(100);
          setStep(4);
        }
        else {
          setErrorMessage('Error occurred during generate short hash link');
        }
      }
      else {
        setErrorMessage('Error occurred druing pinning cid!');
      }
    }
    else {
      setErrorMessage('Error occurred during uploading!');
    }
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item lg={5} md={5} sm={12} xs={12} style={{display: 'grid', textAlign: 'end', alignItems: 'center'}}>
          <span>Files for Sale</span>
        </Grid>
        <Grid item lg={7} md={7} sm={12} xs={12} style={{textAlign: 'start'}}>
          <OutlinedInput type="text" value={`${fileList.length} file${fileList.length === 1 ? '' : 's'} selected`} disabled style={{width: '100%', maxWidth: 300}}/>
        </Grid>
        <Grid item lg={5} md={5} sm={12} xs={12} style={{display: 'grid', textAlign: 'end', alignItems: 'center'}}>
          <span>Name This Item</span>
        </Grid>
        <Grid item lg={7} md={7} sm={12} xs={12} style={{textAlign: 'start'}}>
          <TextField 
            error={!itemName && isSubmit ? true : false}
            value={itemName} 
            onChange={(event) => { setItemName(event.target.value); setSubmit(false); }} 
            style={{width: '100%', maxWidth: 300}}
            helperText={!itemName && isSubmit ? "This field is required" : null}
          />
        </Grid>
        <Grid item lg={5} md={5} sm={12} xs={12} style={{display: 'grid', textAlign: 'end', alignItems: 'center'}}>
          <span>Set Price (ETH)</span>
        </Grid>
        <Grid item lg={7} md={7} sm={12} xs={12} style={{textAlign: 'start'}}>
          <TextField 
            error={(!price || price  <= 0) && isSubmit ? true : false}
            variant="outlined" 
            type="number" 
            inputProps={{ min: "0", step: "0.1"}} 
            value={price} 
            onChange={(event) => { setPrice(event.target.value); setSubmit(false); }} 
            style={{width: '100%', maxWidth: 300}}
            helperText={(!price || price  <= 0) && isSubmit ? "The value should not be null or less than 0." : null}
          />
        </Grid>
      </Grid>
      <Button className={classes.imgButton} onClick={handleClickUpload} style={{marginTop: 20}}>Upload</Button>
      {sizeErrorMessage && <p style={{color: 'red'}}>{sizeErrorMessage}</p>}
    </div>
  );
};

const mapStateToProps = state => ({
  accountAddress: state.account.address,
  signature: state.account.signature
});

export default connect(mapStateToProps, {  })(SecondStep);