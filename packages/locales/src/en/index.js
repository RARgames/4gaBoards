import merge from 'lodash/merge';

import action from './action';
import activity from './activity';
import core from './core';
import error from './error';
import login from './login';

export default {
  language: 'en',
  country: 'gb',
  name: 'English',
  embeddedLocale: merge(action, activity, core, error, login),
  flags: ['GB', 'US'],
};
