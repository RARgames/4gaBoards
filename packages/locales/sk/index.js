import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'sk',
  country: 'sk',
  name: 'Slovenčina',
  embeddedLocale: merge(error, login),
  flags: ['SK'],
};
