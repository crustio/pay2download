import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@mui/styles';
import { connect } from "react-redux";
import { Button, Grid, Snackbar, Box, IconButton, Alert } from '@mui/material';
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
import axios from 'axios';
import { sign } from '../../utils/sign';

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

function createData(no, action, amount, date, status, tx) {
  return { no, action, amount, date, status, tx };
}

const rows = [
  createData('01', 'Claim', '0.25ETH', '2022.01.28', 'Successful', '0x17281902328a232f768c253e3c3dca8206d1aa91139555351c0aecf5dc86972a'),
  createData('02', 'Claim', '0.3ETH', '2022.01.28', 'Successful', '0x17281902328a232f768c253e3c3dca8206d1aa91139555351c0aecf5dc86972a'),
  createData('03', 'Claim', '0.5ETH', '2022.01.28', 'Successful', '0x17281902328a232f768c253e3c3dca8206d1aa91139555351c0aecf5dc86972a'),
  createData('04', 'Claim', '0.12ETH', '2022.01.28', 'Successful', '0x17281902328a232f768c253e3c3dca8206d1aa91139555351c0aecf5dc86972a'),
  createData('05', 'Claim', '0.36ETH', '2022.01.28', 'Successful', '0x17281902328a232f768c253e3c3dca8206d1aa91139555351c0aecf5dc86972a'),
  createData('06', 'Claim', '0.6ETH', '2022.01.28', 'Successful', '0x17281902328a232f768c253e3c3dca8206d1aa91139555351c0aecf5dc86972a'),
];

const MyAccount = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [data, setData] = useState();
  const [claimHistory, setClaimHistory] = useState();
  const { accountAddress, signature } = props;

  useEffect(async () => {
    if(accountAddress && signature) {
      // const signature = await sign(accountAddress, accountAddress);
      const perSignData = `eth-${accountAddress}:${signature}`;
      const base64Signature = window.btoa(perSignData);
      const AuthBearer = `Bearer ${base64Signature}`;
      console.log(accountAddress, 'accountAddress---');
      await axios.request({
        headers: { Authorization: AuthBearer },
        method: 'get',
        url: `https://p2d.crustcode.com/api/v1/accountInfo`
      }).then(result => {
        setData(result.data.data);
      }).catch(error => {
        setErrorMessage('Error occurred during fetch account info.');
      });

      await axios.request({
        headers: { Authorization: AuthBearer },
        method: 'get',
        url: `https://p2d.crustcode.com/api/v1/claimHistory`
      }).then(result => {
        setClaimHistory(result.data.data);
      }).catch(error => {
        setErrorMessage('Error occurred during fetch claim history');
      });
    }
  }, [accountAddress, signature])

  const handleBack = () => {
    history.push('/');
  }

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <Button style={{textTransform: 'none', position: 'absolute', top: 15, left: 20, color: 'black'}} onClick={handleBack}>{"< Go back"}</Button>
        <Grid container style={{height: '96%', width: '98%'}}>
          <Grid item lg={12} md={12} sm={12} xs={12} className={classes.myRevenueBlock}>
            <div>
              <p style={{fontSize: 20, fontWeight: 500}}>My Revenue</p>
              <p style={{fontSize: 15, fontWeight: 300, lineHeight: 0.5}}>Total Revenue: {data?.totalRevenue} ETH</p>
              <p style={{fontSize: 15, fontWeight: 300, lineHeight: 0.5}}>Unclaimed: {data?.unclaimed} ETH</p>
            </div>
            <div style={{paddingLeft: 30, paddingTop: 65}}>
              <Button className={classes.claimBtn}>Claim</Button>
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
                          <TableCell align="right">Action</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="right">Date</TableCell>
                          <TableCell align="right">Status</TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{
                          'tr:nth-of-type(odd)': {backgroundColor: '#F8F8F8'}
                        }}>
                        {claimHistory?.map((row) => (
                          <TableRow
                            key={row.no}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell align="right">{row.no}</TableCell>
                            <TableCell align="right">{row.action}</TableCell>
                            <TableCell align="right">{row.amount}</TableCell>
                            <TableCell align="right">{row.date}</TableCell>
                            <TableCell align="right">{row.status}</TableCell>
                            <TableCell align="right"><Tooltip title={
                              <React.Fragment>
                                <span>{row.tx}
                                <CopyToClipboard text={row.tx} onCopy={() => setInfoOpen(true)} >
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
                <p key={index}>{`#${index+1} ${item.name}, ${item.price} ETH, 25 sold`}</p>
              ))}
            </div>
          </Grid>
          <Grid item lg={6} md={6} sm={12} xs={12} className={classes.myBoughtItemsBlock}>
            <p style={{fontSize: 20, fontWeight: 500}}>My Bought Items</p>
            <div className={classes.listCard}>
              {data?.boughtFiles?.map((item, index) => (
                <p key={index}>{`#${index+1} ${item.name}, ${item.price} ETH, 25 sold`}</p>
              ))}
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  accountAddress: state.account.address,
  signature: state.account.signature
});
export default connect(mapStateToProps, {  })(MyAccount);