import React from 'react';
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material';
import cardImg from '../../assets/card-background.png';
import buttonImg from '../../assets/button.png';

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
}));

const BuyFiles = () => {
    const classes = useStyles();

    return (
      <div className={classes.container}>
        <div className={classes.card}>
            <div>
                <h2>《泰坦尼克号》+ 中文字幕</h2>
                <p>2 Files, 1.9GB, 0.1ETH</p>
                <Button className={classes.imgButton} onClick={() => console.log('pay button clicked')}>Pay 0.1 ETH</Button> 
            </div>
        </div>
      </div>
    );
};
export default BuyFiles;