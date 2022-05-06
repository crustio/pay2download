import React, { useState, useEffect } from 'react';
import styled from 'styled-components'
import { useHistory } from "react-router-dom";
import { makeStyles } from '@mui/styles';
import { connect } from "react-redux";
import { Button, Grid, Snackbar, Box, IconButton, Alert } from '@mui/material';
import LoadingOverlay from 'react-loading-overlay-ts';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import cardImg from '../../assets/card-background.png';
import claimImg from '../../assets/claim_btn.png';
import claimHistoryImg from '../../assets/claim_history.png';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { setGlobalPrivateKey } from '../../redux/actions/AccountActions';
import axios from 'axios';

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
  myRevenueBlock: {
    borderBottom: '1px solid black',
    height: '30%',
    paddingTop: 50,
    paddingLeft: 30,
    paddingRight: 30,
    display: 'flex',
    textAlign: 'left'
  },
  mySellingItemsBlock: {
    borderRight: '1px solid black',
    height: '70%',
    textAlign: 'left',
    paddingLeft: 30,
    '@media only screen and (max-width: 900px)' : {
      height: '35%'
    }
  },
  myBoughtItemsBlock: {
    height: '70%',
    textAlign: 'left',
    paddingLeft: 30,
    '@media only screen and (max-width: 900px)': {
      borderTop: '1px solid black',
      height: '35%'
    }
  },
  listCard: {
    overflow: 'auto',
    height: '80%',
    '@media only screen and (max-width: 900px)': {
      height: '60%'
    }
  },
  claimBtn: {
    backgroundImage: `url(${claimImg})`, 
    backgroundRepeat: 'no-repeat', 
    backgroundSize: 'contain',
    width: 93,
    height: 31,
    color: 'black !important',
    fontWeight: '600 !important',
    textTransform: 'none !important',
    marginRight: '20px !important'
  },
  claimHistoryBtn: {
    backgroundImage: `url(${claimHistoryImg})`, 
    backgroundRepeat: 'no-repeat', 
    backgroundSize: 'contain',
    width: 215,
    height: 31,
    color: 'black !important',
    fontWeight: '600 !important',
    textTransform: 'none !important',
  },
  copyIcon: {
    fontSize: '13px !important',
    marginLeft: 15,
    paddingTop: 5,
    "&:hover": {
      cursor: "pointer"
    }
  },
  closeButton: {
    float: 'right',
    "&:hover": {
      color: "black"
    }
  },
  closeIcon: {
    fontSize: '1rem !important',
    "&:hover": {
      color: "black"
    }
  }
}));

const StyledLoader = styled(LoadingOverlay)`
  height: 100%;
`

const status = {
  0: 'Newly Build',
  1: 'Pending',
  2: 'Success',
  3: 'Failed',
}


const MyAccount = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [shareLinkOpen, setShareLinkOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [data, setData] = useState();
  const [claimHistory, setClaimHistory] = useState();
  const [loading, setLoading] = useState(false);
  const { accountAddress, signature, isLoggedIn, setGlobalPrivateKey } = props;

  useEffect(() => {
    setGlobalPrivateKey(null);
  }, []);

  useEffect(() => {
    fetchAccountInfo();
  }, [accountAddress, signature])

  const handleBack = () => {
    history.push('/');
  }

  const fetchAccountInfo = async () => {
    if(accountAddress && signature && accountAddress.length > 0) {
      setLoading(true);
      // const signature = await sign(accountAddress, accountAddress);
      const perSignData = `eth-${accountAddress}:${signature}`;
      const base64Signature = window.btoa(perSignData);
      const AuthBearer = `Bearer ${base64Signature}`;
      await axios.request({
        headers: { Authorization: AuthBearer },
        method: 'get',
        url: `https://p2d.crustcode.com/api/v1/accountInfo`
      }).then(result => {
        setData(result.data.data);
      }).catch(error => {
        console.log('Error occurred during fetch account info.');
      });

      await axios.request({
        headers: { Authorization: AuthBearer },
        method: 'get',
        url: `https://p2d.crustcode.com/api/v1/claimHistory`
      }).then(result => {
        setClaimHistory(result.data.data);
        setLoading(false);
      }).catch(error => {
        console.log('Error occurred during fetch claim history');
        
      });
    }
  }

  const onClickClaim = async () => {
    if(data?.unclaimed === 0) {
      setErrorMessage('No revenue can be claimed!');
    }
    else {
      const perSignData = `eth-${accountAddress}:${signature}`;
      const base64Signature = window.btoa(perSignData);
      const AuthBearer = `Bearer ${base64Signature}`;
  
      await axios.request({
        headers: { Authorization: AuthBearer },
        method: 'post',
        url: `https://p2d.crustcode.com/api/v1/claim`
      }).then(result => {
        fetchAccountInfo();
      }).catch(error => {
        setErrorMessage('Error occurred during fetch claim');
      });
    }
  }

  const onClickDownload = async (fileCid, shareLink) => {
    const perSignData = `eth-${accountAddress}:${signature}`;
    const base64Signature = window.btoa(perSignData);
    const AuthBearer = `Bearer ${base64Signature}`;

    await axios.request({
      headers: { Authorization: AuthBearer },
      method: 'get',
      url: `https://p2d.crustcode.com/api/v1/download/${fileCid}`
    }).then(result => {
      if(result.data.data.status === true) {
        setGlobalPrivateKey(result.data.data.result.private_key);
        history.push(`/buy-files/${shareLink}`);
      }
    }).catch(error => {
      setErrorMessage('Error occurred during private key');
    });
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
          <Button style={{textTransform: 'none', position: 'absolute', top: 15, left: 20, color: 'black'}} onClick={handleBack}>{"< Go back"}</Button>
          {isLoggedIn ? 
            <React.Fragment>
              {signature ? 
              <Grid container style={{height: '96%', width: '98%'}}>
                <Grid item lg={12} md={12} sm={12} xs={12} className={classes.myRevenueBlock}>
                  <div>
                    <p style={{fontSize: 20, fontWeight: 500}}>My Revenue</p>
                    <p style={{fontSize: 15, fontWeight: 300, lineHeight: 0.5}}>Total Revenue: {data?.totalRevenue} ETH</p>
                    <p style={{fontSize: 15, fontWeight: 300, lineHeight: 0.5}}>Unclaimed: {data?.unclaimed} ETH</p>
                    <p style={{color: 'red'}}>{errorMessage}</p>
                  </div>
                  <div style={{paddingLeft: 30, paddingTop: 65}}>
                    <Button className={classes.claimBtn} onClick={() => onClickClaim()}>Claim</Button>
                    <Button className={classes.claimHistoryBtn} onClick={() => setOpen(true)}>Check Claim History</Button>
                    <Dialog onClose={() => setOpen(false)} open={open} maxWidth="md">
                      <DialogTitle>
                        <Box>
                          <span>Check Claim History</span>
                          <IconButton onClick={() => setOpen(false)} className={classes.closeButton}>
                            <CloseIcon className={classes.closeIcon} />
                          </IconButton>
                        </Box>
                      </DialogTitle>
                      <DialogContent>
                        <TableContainer component={Paper}>
                          <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                              <TableRow>
                                <TableCell>No.</TableCell>
                                <TableCell align="left">Action</TableCell>
                                <TableCell align="left">Amount</TableCell>
                                <TableCell align="left">Date</TableCell>
                                <TableCell align="left">Status</TableCell>
                                <TableCell align="left"></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody sx={{
                                'tr:nth-of-type(odd)': {backgroundColor: '#F8F8F8'}
                              }}>
                              {claimHistory?.map((row, index) => (
                                <TableRow
                                  key={`row-${index}`}
                                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell align="left">{`Claim`}</TableCell>
                                  <TableCell align="left">{row.amount} ETH</TableCell>
                                  <TableCell align="left">{row.create_time.replace('T', ' ').replace('.000Z', '')}</TableCell>
                                  <TableCell align="left">{status[row.status]}</TableCell>
                                  <TableCell align="left"><Tooltip title={
                                    <React.Fragment>
                                      <span>{row.tx_hash}
                                      <CopyToClipboard text={row.tx_hash} onCopy={() => setInfoOpen(true)} >
                                        <ContentCopyIcon className={classes.copyIcon}/>
                                      </CopyToClipboard>
                                      </span>
                                    </React.Fragment>
                                  } arrow placement="top" componentsProps={{
                                    tooltip: {
                                      sx: {
                                        color: "black",
                                        backgroundColor: "white",
                                        boxShadow: "0 0 6px rgba(100, 100, 100, 0.5)"
                                      }
                                    },
                                    arrow: {
                                      sx: {
                                        color: 'white',
                                      }
                                    }
                                  }}><u>Tx</u></Tooltip></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </DialogContent>
                      <Snackbar open={infoOpen} autoHideDuration={2000} onClose={() => setInfoOpen(false)}>
                        <Alert onClose={() => setInfoOpen(false)} severity="success" sx={{ width: '100%' }}>
                          Transaction address copied!
                        </Alert>
                      </Snackbar>
                    </Dialog>
                  </div>
                </Grid>
                <Grid item lg={6} md={6} sm={12} xs={12} className={classes.mySellingItemsBlock}>
                  <p style={{fontSize: 20, fontWeight: 500}}>My Selling Items</p>
                  <div className={classes.listCard}>
                    {data?.soldFiles?.map((item, index) => (
                      <p key={`sold-files-${index}`}>{`#${index+1} ${item.name}, ${item.price < 0.00001 ? parseFloat(item.price) : item.price} ETH, ${item.buyers.length} sold, `} 
                      <CopyToClipboard text={`${window.location.origin}/buy-files/${item.share_link}`} onCopy={() => setShareLinkOpen(true)} >
                        <a href='#'>Share Link</a>
                      </CopyToClipboard>
                      </p>
                    ))}
                  </div>
                </Grid>
                <Grid item lg={6} md={6} sm={12} xs={12} className={classes.myBoughtItemsBlock}>
                  <p style={{fontSize: 20, fontWeight: 500}}>My Bought Items</p>
                  <div className={classes.listCard}>
                    {data?.boughtFiles?.map((item, index) => (
                      <p key={`bought-files-${index}`}>
                        <span>{`#${index+1} ${item.name}, ${item.price < 0.00001 ? parseFloat(item.price) : item.price} ETH, ${status[item.status]} `}</span> 
                        {item.status === 2 && <a href="#" onClick={() => onClickDownload(item.cid, item.share_link)}>Download</a>}
                      </p>
                    ))}
                  </div>
                </Grid>
                <Snackbar open={shareLinkOpen} autoHideDuration={2000} onClose={() => setShareLinkOpen(false)}>
                  <Alert onClose={() => setShareLinkOpen(false)} severity="success" sx={{ width: '100%' }}>
                    Share link copied!
                  </Alert>
                </Snackbar>
              </Grid>
              
              : 
              <div>
                <h2>You didn't sign from Metamask. Please check Metamask or refresh page.</h2>
              </div>
              }
            </React.Fragment>
            : 
            <div>
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
  isLoggedIn: state.account.isLoggedIn
});
export default connect(mapStateToProps, { setGlobalPrivateKey })(MyAccount);