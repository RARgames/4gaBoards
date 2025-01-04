import merge from 'lodash/merge';

import core from './core';
import login from './login';

export default {
  language: 'en',
  country: 'gb',
  name: 'English',
  embeddedLocale: merge(login, core),
};
