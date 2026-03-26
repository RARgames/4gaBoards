import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'es',
  country: 'es',
  name: 'Español',
  embeddedLocale: merge(error, login),
  flags: ['ES'],
};
