import React from 'react';
import ReactDOM from 'react-dom/client';

import Root from './components/Root';
import history from './history';
import store from './store';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
