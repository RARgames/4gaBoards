import React from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router';
import PropTypes from 'prop-types';

import Paths from '../constants/Paths';
import CoreContainer from '../containers/CoreContainer';
import LoginContainer from '../containers/LoginContainer';
import NotFoundContainer from '../containers/NotFoundContainer';
import RegisterContainer from '../containers/RegisterContainer';
import { ReduxRouter } from '../lib/redux-router';

import 'react-datepicker/dist/react-datepicker.css';

import 'photoswipe/dist/photoswipe.css';
import '../assets/styles.css';
import '../colors.css';
import '../backgrounds.module.scss';
import '../root.module.scss';

function Root({ store, history }) {
  return (
    <Provider store={store}>
      <ReduxRouter history={history}>
        <Routes>
          <Route path={Paths.LOGIN} element={<LoginContainer />} />
          <Route path={Paths.REGISTER} element={<RegisterContainer />} />
          <Route path={Paths.ROOT} element={<CoreContainer />} />
          <Route path={Paths.PROJECTS} element={<CoreContainer />} />
          <Route path={Paths.BOARDS} element={<CoreContainer />} />
          <Route path={Paths.CARDS} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS_PROFILE} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS_PREFERENCES} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS_ACCOUNT} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS_AUTHENTICATION} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS_ABOUT} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS_INSTANCE} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS_USERS} element={<CoreContainer />} />
          <Route path={Paths.SETTINGS_PROJECT} element={<CoreContainer />} />
          <Route path={Paths.NOTIFICATIONS} element={<CoreContainer />} />
          <Route path="*" element={<NotFoundContainer />} />
        </Routes>
      </ReduxRouter>
    </Provider>
  );
}

Root.propTypes = {
  store: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Root;
