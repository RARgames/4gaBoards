import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'pl',
  country: 'pl',
  name: 'Polski',
  embeddedLocale: merge(error, login),
  flags: ['PL'],
};
