import React from 'react';
import axios from 'axios';
import { makeStyles } from '@mui/styles';
import { Button, Grid, OutlinedInput, LinearProgress, TextField } from '@mui/material';
import { FileUploader } from "react-drag-drop-files";
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import cardImg from '../../assets/card-background.png';
import buttonImg from '../../assets/button.png';
import buttonSecImg from '../../assets/button_sec.png';
import buttonOrangeImg from '../../assets/button_orange.png';
import { connect } from "react-redux";
import { sign } from '../../utils/sign';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import { encryptFile } from '../../utils/encrypt';
import {Cypher} from "@zheeno/mnemonic-cypher";

const WordsCount = 8

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
      textAlign: 'center',
      position: 'relative'
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
    addMoreButton: {
      backgroundImage: `url(${buttonSecImg})`, 
      backgroundRepeat: 'no-repeat', 
      backgroundSize: 'contain',
      width: 150,
      height: 40,
      color: 'white !important',
      textTransform: 'none !important',
      marginRight: '4rem !important',
      marginLeft: '-2rem !important'
    },
    continueButton: {
      backgroundImage: `url(${buttonOrangeImg})`, 
      backgroundRepeat: 'no-repeat', 
      backgroundSize: 'contain',
      width: 150,
      height: 40,
      color: 'white !important',
      textTransform: 'none !important',
      marginRight: '4rem !important',
      marginLeft: '-2rem !important'
    },
    fileDragAndDrop: {
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
    }
  }));

const BrowseFiles = (props) => {
  const classes = useStyles();
  const [fileList, setFileList] = React.useState([]);
  const [isUpdate, setIsUpdate] = React.useState(true);
  const [step, setStep] = React.useState(1);
  const [update, setUpState] = React.useState(0);
  const hiddenFileInput = React.useRef(null);
  const hiddenMoreFileInput = React.useRef(null);
  const [itemName, setItemName] = React.useState('');
  const [price, setPrice] = React.useState(0);
  const [shareLink, setShareLink] = React.useState('');
  const [isSubmit, setSubmit] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState();
  const { accountAddress, signature } = props;

  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  const handleMoreClick = event => {
    hiddenMoreFileInput.current.click();
  };

  const handleClickContinue = event => {
    setStep(step+1);
  }

  const handleClickUpload = async (event) => {
    setSubmit(true);

    if (itemName && price && price > 0) {
      // Compose all files into a folder
      let zip = new JSZip();
      var count = 0;
      fileList.forEach(function(file) {
        JSZipUtils.getBinaryContent(file._webkitRelativePath || file.webkitRelativePath, function (err, data) {
          if(err) {
            throw err;
          }
          zip.file(file.name, data, {binary: true});
          count++;
          if (count === fileList.length) {
            zip.generateAsync({type:'blob'}).then(async (content) => {
              setStep(step+1); // Move to progress page.
              setUpState(0); // Set start progress 0.
              // Encrypt the file with public key
              const cypher = new Cypher(WordsCount);
              const {secret, mnemonics} = cypher.genMnemonics();
              const encryptedData = await encryptFile(content, window.btoa(secret));
              const encryptedFile = new Blob([encryptedData], { type: 'application/zip' });

              // Upload the folder to IPFS W3Auth GW -> single cid back
              // const signature = await sign(accountAddress, accountAddress);
              console.log(signature, 'signature files');
              const perSignData = `eth-${accountAddress}:${signature}`;
              const base64Signature = window.btoa(perSignData);
              const AuthBasic = `Basic ${base64Signature}`;
              const AuthBearer = `Bearer ${base64Signature}`;
              const cancel = axios.CancelToken.source();

              const form = new FormData();
              form.append('file', encryptedFile, `${itemName}.zip`);

              const UpEndpoint = 'https://crustwebsites.net';
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
                  url: `${UpEndpoint}/api/v0/add`
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
                        private_key: mnemonics
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
            });
          }
        });
      });
    }
  }

  const handleBack = event => {
    setStep(step-1);
    setErrorMessage(null);
  }

  const handleChange = event => {
    var fileArr = [];
    Object.keys(event.target.files).forEach(key => fileArr.push(event.target.files[key]));
    setFileList(fileArr);
  }

  const handleDragAndDropChange = file => {
    var fileArr = [];
    Object.keys(file).forEach(key => fileArr.push(file[key]));
    setFileList(fileArr);
  }

  const handleMoreChange = event => {
    var fileArr = [];
    var originArr = fileList;
    Object.keys(event.target.files).forEach(key => fileArr.push(event.target.files[key]));
    setFileList(originArr.concat(fileArr));
  }

  const removeFile = (index) => {
    if(isUpdate) {
      setIsUpdate(false);
    }
    else {
      setIsUpdate(true);
    }

    var fileArr = fileList;
    fileArr.splice(index, 1);
    setFileList(fileArr);
  }

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        {
          (step === 2 || step === 3) &&
          <Button style={{textTransform: 'none', position: 'absolute', top: 15, left: 20, color: 'black'}} onClick={handleBack}>{"< Go back"}</Button>
        }
        {step === 1 && <React.Fragment>
          {fileList.length === 0 ? 
            <div>
                <FileUploader 
                  multiple={true}
                  name="file"
                  handleChange={handleDragAndDropChange}
                >
                  <div className={classes.fileDragAndDrop}></div>
                </FileUploader>
                <h2>Drag & Drop Files Here</h2>
                <h2>or</h2>
                <Button className={classes.imgButton} onClick={handleClick}>Browse Files</Button> 
                <input type='file' onChange={handleChange} multiple style={{display: 'none'}} ref={hiddenFileInput}/>
            </div>
          :
            <div>
              <div style={{marginBottom: '30px'}}>
              <TableContainer style={{ maxHeight: '20rem' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{
                    'tr:nth-of-type(odd)': {backgroundColor: '#F8F8F8'}
                  }}>
                    {fileList.map((file, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, 'td': {padding: 0}}}
                      >
                        <TableCell component="th" scope="row">
                          {file.name}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => removeFile(index)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </TableContainer>
              </div>
              <Button className={classes.addMoreButton} onClick={handleMoreClick}>Add More</Button>
              <Button className={classes.continueButton} onClick={handleClickContinue}>Continue</Button>
              <input type='file' onChange={handleMoreChange} multiple style={{display: 'none'}} ref={hiddenMoreFileInput}/>
            </div>
          }
        </React.Fragment>}
        {step === 2 && <div>
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
        </div>}
        {step === 3 && <div>
          <h3 style={{color: errorMessage ? 'red' : null}}>{errorMessage ? errorMessage : "Waiting for Encryption & Uploading..."}</h3>
          <LinearProgress variant="determinate" value={update}/>
        </div>}
        {step === 4 && <div>
          <h1>Congratulations!</h1>
          <h3>You have successfully created a sale item.</h3>
          <h3>Sharelinks:<a target="_blank" rel="noreferrer" href={`https://www.sell.crustfiles.io/${shareLink}`} style={{color: '#FF8D00'}}>www.sell.crustfiles.io/{shareLink}</a></h3>
        </div>}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  accountAddress: state.account.address,
  signature: state.account.signature
});

export default connect(mapStateToProps, {  })(BrowseFiles);