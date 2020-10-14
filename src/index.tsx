import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import WalletProvider from './context/WalletProvider'
import { Router, Route, Switch } from 'react-router-dom'
// @ts-ignore
import { GlobalNotification, GlobalModal } from "slate-react-system";
import * as serviceWorker from './serviceWorker';
import Preonboarding from './pages/Preonboarding';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import LandingB from './pages/LandingB';
import history from './context/History';
import Verifiers from './pages/Verifiers';
import VerifiersB from './pages/VerifiersB';
import VerifiersC from './pages/VerifiersC';


ReactDOM.render(
  <React.StrictMode>
    <WalletProvider>
      <Router history={history}>
        <Switch>
          <Route exact path={'/'} component={Onboarding} ></Route>
          <Route exact path={'/app'} component={App} ></Route>
          <Route exact path={'/wallet'} component={Preonboarding} ></Route>
          <Route exact path={'/landing'} component={Landing} ></Route>
          <Route exact path={'/landingB'} component={LandingB} ></Route>
          <Route exact path={'/verifiers'} component={Verifiers} ></Route>
          <Route exact path={'/verifiersB'} component={VerifiersB} ></Route>
          <Route exact path={'/verifiersC'} component={VerifiersC} ></Route>
        </Switch>
      </Router>
      <GlobalNotification style={{ bottom: 0, right: 0 }} />
      <GlobalModal style={{ maxWidth: "none" }} />
    </WalletProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
