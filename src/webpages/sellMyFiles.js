import React from 'react';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material';
import cardImg from '../assets/card-background.png';
import buttonImg from '../assets/button.png';

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

const SellMyFiles = () => {
    const classes = useStyles();
    const history = useHistory();

    return (
      <div className={classes.container}>
        <div className={classes.card}>
          <Button className={classes.imgButton} onClick={() => history.push('/browse-files')}>Sell My Files</Button> 
        </div>
      </div>
    );
};
export default SellMyFiles;