import React from 'react';
import ReactDOM from 'react-dom/client';

import Root from './components/Root';
import history from './history';
import store from './store';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registration successful:', registration); // eslint-disable-line no-console
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error); // eslint-disable-line no-console
      });
  });
}
