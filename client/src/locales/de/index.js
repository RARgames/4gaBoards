import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'de',
  country: 'de',
  name: 'Deutsch',
  embeddedLocale: merge(error, login),
  flags: ['DE'],
};
