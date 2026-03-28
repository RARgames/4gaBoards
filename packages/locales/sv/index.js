import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'sv',
  country: 'se',
  name: 'Svenska',
  embeddedLocale: merge(error, login),
  flags: ['SE'],
};
