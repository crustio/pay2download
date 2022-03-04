import React from 'react';
import Header from './Header';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import FooterImg from '../assets/footer.png';
import { makeStyles } from '@mui/styles';

// component styles
const Wrapper = styled.div`
        display: flex;
        top: 64px;
        position: relative;
        height: calc(100% - 64px);
        width: 100%;
        flex: auto;
        flex-direction: column;
`;
const Main = styled.main`
    position: fixed;
    height: calc(100% - 64px);
    width: 100%;
    padding-top: 0px;
    padding-bottom: 0px;
    @media (min-width: 700px) {
        flex: 1;
        height: calc(100% - 64px);
        width: 100%;
    }
`;
const hide_header_routes = [
    '/'
  ];

const useStyles = makeStyles(theme => ({
    homeBackground: {
        backgroundImage: `url(${FooterImg})`, 
        backgroundRepeat: 'no-repeat', 
        backgroundSize: 'contain', 
        backgroundPosition: 'bottom'
    },
}));

const Layout = ({ children }) => {
    const location = useLocation();
    const classes = useStyles();
    return (
        <React.Fragment>
            {hide_header_routes.indexOf(location.pathname) > -1 ? null : <Header />}
            <Wrapper>
                <Main className={hide_header_routes.indexOf(location.pathname) > -1 ? classes.homeBackground : null}>{children}</Main>
            </Wrapper>
        </React.Fragment>
    );
};
export default Layout;