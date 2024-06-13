import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { ReduxRouter } from '../lib/redux-router';

import Paths from '../constants/Paths';
import LoginContainer from '../containers/LoginContainer';
import RegisterContainer from '../containers/RegisterContainer';
import CoreContainer from '../containers/CoreContainer';
import NotFoundContainer from '../containers/NotFoundContainer';

import 'react-datepicker/dist/react-datepicker.css';
import 'photoswipe/dist/photoswipe.css';
import '../assets/styles.css';

import '../styles.module.scss';

function Root({ store, history }) {
  return (
    <Provider store={store}>
      <ReduxRouter history={history}>
        <Routes>
          <Route path={Paths.LOGIN} element={<LoginContainer />} />
          <Route path={Paths.REGISTER} element={<RegisterContainer />} />
          <Route path={Paths.ROOT} element={<CoreContainer path={Paths.ROOT} />} />
          <Route path={Paths.PROJECTS} element={<CoreContainer path={Paths.PROJECTS} />} />
          <Route path={Paths.BOARDS} element={<CoreContainer path={Paths.BOARDS} />} />
          <Route path={Paths.CARDS} element={<CoreContainer path={Paths.CARDS} />} />
          <Route path={Paths.SETTINGS} element={<CoreContainer path={Paths.SETTINGS} />} />
          <Route path={Paths.SETTINGS_PROFILE} element={<CoreContainer path={Paths.SETTINGS_PROFILE} />} />
          <Route path={Paths.SETTINGS_PREFERENCES} element={<CoreContainer path={Paths.SETTINGS_PREFERENCES} />} />
          <Route path={Paths.SETTINGS_ACCOUNT} element={<CoreContainer path={Paths.SETTINGS_ACCOUNT} />} />
          <Route path={Paths.SETTINGS_AUTHENTICATION} element={<CoreContainer path={Paths.SETTINGS_AUTHENTICATION} />} />
          <Route path={Paths.SETTINGS_ABOUT} element={<CoreContainer path={Paths.SETTINGS_ABOUT} />} />
          <Route path={Paths.SETTINGS_INSTANCE} element={<CoreContainer path={Paths.SETTINGS_INSTANCE} />} />
          <Route path={Paths.SETTINGS_USERS} element={<CoreContainer path={Paths.SETTINGS_USERS} />} />
          <Route path={Paths.SETTINGS_PROJECT} element={<CoreContainer path={Paths.SETTINGS_PROJECT} />} />
          <Route path="*" element={<NotFoundContainer path={Paths.SETTINGS_PROJECT} />} />
        </Routes>
      </ReduxRouter>
    </Provider>
  );
}

Root.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
};

export default Root;
