import React from 'react';
import { makeStyles } from '@mui/styles';
import { styled, alpha } from '@mui/material/styles';
import { Button, Menu, MenuItem } from '@mui/material';
import { FileUploader } from "react-drag-drop-files";
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import buttonImg from '../../assets/button.png';
import buttonSecImg from '../../assets/button_sec.png';
import buttonOrangeImg from '../../assets/button_orange.png';
import Tooltip from '@mui/material/Tooltip';
import { UPLOAD_TYPE_FILE, UPLOAD_TYPE_FOLDER } from '../../utils/constants';

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
    },
  }));

  const StyledMenu = styled((props) => (
    <Menu
      elevation={0}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
    />
  ))(({ theme }) => ({
    '& .MuiPaper-root': {
      borderRadius: 6,
      marginTop: theme.spacing(1),
      width: 300,
      color:
        theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
      boxShadow:
        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      '& .MuiMenu-list': {
        padding: '4px 0',
      },
      '& .MuiMenuItem-root': {
        '& .MuiSvgIcon-root': {
          fontSize: 18,
          color: theme.palette.text.secondary,
          marginRight: theme.spacing(1.5),
        },
        '&:active': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  }));

const FirstStep = (props) => {
  const classes = useStyles();
  const [isUpdate, setIsUpdate] = React.useState(true);
  const [typeErrorMessage, setTypeErrorMessage] = React.useState();
  const hiddenFileInput = React.useRef(null);
  const hiddenFolderInput = React.useRef(null);
  const hiddenMoreFileInput = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuOpen = Boolean(anchorEl);
  const { setSizeErrorMessage, fileList, setFileList, step, setStep } = props;

  const handleClickBrowseFiles = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  }

  const handleClick = type => {
    if(type === UPLOAD_TYPE_FILE) {
      hiddenFileInput.current.click();
    }
    else {
      hiddenFolderInput.current.click();
    }
    setAnchorEl(null);
  };

  const handleMoreClick = event => {
    hiddenMoreFileInput.current.click();
  };

  const handleClickContinue = event => {
    setStep(step+1);
  }

  const handleChange = event => {
    var fileArr = [];
    setSizeErrorMessage(null);
    setTypeErrorMessage(null);
    Object.keys(event.target.files).forEach(key => fileArr.push(event.target.files[key]));
    setFileList(fileArr);
  }

  const handleDragAndDropChange = async (file) => {
    var isContainFolder = false;
    var fileArr = [];
    setSizeErrorMessage(null);
    setTypeErrorMessage(null);
    for(let i=0; i<file.length; i++) {
      const response = await isFile(file[i]);
      if(response === "NotFoundError") isContainFolder = true;
      fileArr.push(file[i]);
    };

    if(isContainFolder) {
      setTypeErrorMessage('Can\'t upload folder using drag and drop zone. Please use Browse File button.');
    }
    else {
      setFileList(fileArr);
    }
  }

  const isFile = (maybeFile) => {
    return new Promise(function (resolve, reject) {
      if (maybeFile.type !== '') {
        return resolve(maybeFile)
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.error && reader.error.name === 'NotFoundError') {
          return resolve(reader.error.name)
        }
        resolve(maybeFile)
      }
      reader.readAsBinaryString(maybeFile)
    })
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
    <React.Fragment>
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
          <Button className={classes.imgButton} onClick={handleClickBrowseFiles}>Browse Files</Button>
          <StyledMenu 
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => handleClick(UPLOAD_TYPE_FILE)}>Upload Files</MenuItem>
            <MenuItem onClick={() => handleClick(UPLOAD_TYPE_FOLDER)}>Upload Folder</MenuItem>
          </StyledMenu>
          {typeErrorMessage && <p style={{color: 'red'}}>{typeErrorMessage}</p>}
          <input type='file' onChange={handleChange} multiple style={{display: 'none'}} ref={hiddenFileInput}  />
          <input type='file' onChange={handleChange} style={{display: 'none'}} ref={hiddenFolderInput} directory="" webkitdirectory="" />
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
                      <Tooltip title={
                          <span>{file.name}</span>
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
                      }}><span>{file.name.length > 20 ? file.name.slice(0, 20) + '...' : file.name}</span></Tooltip>
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
    </React.Fragment>
  );
};

export default FirstStep;