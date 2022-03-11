import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import Home from './home';
import SellMyFiles from './sellMyFiles';
import BrowseFiles from './browserFiles';
import MyAccount from './myAccount';
import BuyFiles from './buyFiles';
import Layout from '../components/Layout';


const Webpages = () => {
    return(
        <Router>
          <Layout>
            <Route exact path="/" component= {Home} />
            <Route path = "/sell-my-files" component = {SellMyFiles} />
            <Route path = "/browse-files" component = {BrowseFiles} />
            <Route path = "/my-account" component = {MyAccount} />
            <Route path = "/buy-files" component = {BuyFiles} />
          </Layout>
        </Router>
    );
};
export default Webpages;