import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import { connect } from "react-redux";
import Home from './home';
import SellMyFiles from './sellMyFiles';
import BrowseFiles from './browserFiles';
import MyAccount from './myAccount';
import BuyFiles from './buyFiles';
import Layout from '../components/Layout';
import { setIsLoggedIn } from '../redux/actions/AccountActions';

const Webpages = (props) => {
  const { setIsLoggedIn } = props;

  useEffect(() => {
    if(window.ethereum) {
      window.ethereum
      .request({ method: 'eth_accounts' })
      .then((res) => {
        if(res.length > 0) setIsLoggedIn(true);
        else {
          setIsLoggedIn(false);
          window.ethereum.request({ method: 'eth_requestAccounts' });
        }
      })
      .catch(console.error);
    }
  }, [window.ethereum])

  return(
      <Router>
        <Layout>
          <Route exact path="/" component= {Home} />
          <Route path = "/sell-my-files" component = {SellMyFiles} />
          <Route path = "/browse-files" component = {BrowseFiles} />
          <Route path = "/my-account" component = {MyAccount} />
          <Route path = "/buy-files/:shortlink" component = {BuyFiles} />
        </Layout>
      </Router>
  );
};

export default connect(null, { setIsLoggedIn })(Webpages);