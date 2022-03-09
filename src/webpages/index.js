import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import Home from './home';
import SellMyFiles from './sellMyFiles';
import BrowseFiles from './browserFiles';

import Layout from '../components/Layout';

const Webpages = () => {
    return(
        <Router>
          <Layout>
            <Route exact path="/" component= {Home} />
            <Route path = "/sell-my-files" component = {SellMyFiles} />
            <Route path = "/browse-files" component = {BrowseFiles} />
          </Layout>
        </Router>
    );
};
export default Webpages;