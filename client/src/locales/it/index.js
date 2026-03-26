import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'it',
  country: 'it',
  name: 'Italiano',
  embeddedLocale: merge(error, login),
  flags: ['IT'],
};
