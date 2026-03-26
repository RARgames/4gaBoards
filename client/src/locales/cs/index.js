import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'cs',
  country: 'cz',
  name: 'Čeština',
  embeddedLocale: merge(error, login),
  flags: ['CZ'],
};
