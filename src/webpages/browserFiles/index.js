import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material';
import ProgressBar from "@ramonak/react-progress-bar";
import cardImg from '../../assets/card-background.png';
import buttonImg from '../../assets/button.png';
import FirstStep from './firstStep';
import SecondStep from './secondStep';

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
    progressLabel: {
      fontSize: 36,
      fontWeight: 500,
      lineHeight: 0,
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

const BrowseFiles = (props) => {
  const classes = useStyles();
  const [fileList, setFileList] = React.useState([]);
  const [cancel, setCancel] = React.useState();
  const [step, setStep] = React.useState(1);
  const [update, setUpState] = React.useState(0);
  const [shareLink, setShareLink] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState();
  const [sizeErrorMessage, setSizeErrorMessage] = React.useState();
  const { signature, isLoggedIn } = props;

  const handleBack = event => {
    setStep(step-1);
    setUpState(0);
    cancel.cancel();
    setErrorMessage(null);
    setSizeErrorMessage(null);
  }

  useEffect(() => {
    console.log(update, '%')
  }, [update]);

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        {
          (step === 2 || step === 3) &&
          <Button style={{textTransform: 'none', position: 'absolute', top: 15, left: 20, color: 'black'}} onClick={handleBack}>{"< Go back"}</Button>
        }
        {
          isLoggedIn 
          ? 
          <React.Fragment>
            {signature ? <React.Fragment>
              {step === 1 && <FirstStep
                fileList={fileList}
                setFileList={setFileList}
                setSizeErrorMessage={setSizeErrorMessage}
                step={step}
                setStep={setStep}
              />}
              {step === 2 ? <SecondStep
                fileList={fileList}
                sizeErrorMessage={sizeErrorMessage}
                step={step}
                setCancel={setCancel}
                setUpState={setUpState}
                setShareLink={setShareLink}
                setErrorMessage={setErrorMessage}
                setSizeErrorMessage={setSizeErrorMessage}
                setStep={setStep}
              /> : null}
              {step === 3 && <div>
                <h3 className={classes.progressLabel} style={{color: errorMessage ? 'red' : null}}>{errorMessage ? errorMessage : "Waiting for Encryption & Uploading..."}</h3>
                <ProgressBar completed={update} borderRadius="0px" isLabelVisible={false} height="40px" bgColor={"#56BA28"} style={{border: '1px solid black'}} className="progressWrapper"/>
                <Button className={classes.imgButton} onClick={handleBack} style={{marginTop: 20}}>Cancel</Button>
              </div>}
              {step === 4 && <div>
                <h1>Congratulations!</h1>
                <h3>You have successfully created a sale item.</h3>
                <h3>Share links: <a target="_blank" rel="noreferrer" href={`${window.location.origin}/buy-files/${shareLink}`} style={{color: '#FF8D00'}}>{window.location.origin}/buy-files/{shareLink}</a></h3>
              </div>}
            </React.Fragment> : <React.Fragment>
              <div>
                <h2>You didn't sign from Metamask. Please check Metamask or refresh page.</h2>
              </div>
            </React.Fragment>}
          </React.Fragment>
          :
          <div>
            <h2>You are not logged into Metamask. Please login first.</h2>
          </div>
        }
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  signature: state.account.signature,
  isLoggedIn: state.account.isLoggedIn
});

export default connect(mapStateToProps, {  })(BrowseFiles);