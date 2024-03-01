import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Tipbsv } from './contracts/tipbsv';
import artifact from '../artifacts/tipbsv.json';
import { Scrypt, bsv } from 'scrypt-ts';

Tipbsv.loadArtifact(artifact);

Scrypt.init({
  // https://docs.scrypt.io/advanced/how-to-integrate-scrypt-service#get-your-api-key
  apiKey: 'testnet_321zy5W7IKI2JYRToKIfH5k5ZtSrNB8tHWiooEBgPGhfoVatU',
  network: bsv.Networks.testnet
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
