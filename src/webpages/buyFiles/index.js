import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material';
import cardImg from '../../assets/card-background.png';
import buttonImg from '../../assets/button.png';
import { useParams } from "react-router-dom";

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

const BuyFiles = () => {
    const classes = useStyles();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState();
    const [numberOfFiles, setNumberOfFiles] = useState();
    const [size, setSize] = useState();
    const [price, setPrice] = useState();
    const [fileExist, setFileExist] = useState(true);
    let { cid } = useParams();

    useEffect(() => {
      axios.get("/api/files", { data: cid }).then((res) => {
        if(res.data) {
          setName(res.data.name);
          setNumberOfFiles(res.data.numberOfFiles);
          setSize(res.data.size);
          setPrice(res.data.price);
        }
        else {
          setFileExist(false);
        }
      });
    });

    const clickPayButton = () => {
      setStep(2);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
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
export default BuyFiles;