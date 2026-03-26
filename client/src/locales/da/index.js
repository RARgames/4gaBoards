import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'da',
  country: 'dk',
  name: 'Dansk',
  embeddedLocale: merge(error, login),
  flags: ['DK'],
};
