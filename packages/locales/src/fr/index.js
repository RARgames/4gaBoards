import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'fr',
  country: 'fr',
  name: 'Français',
  embeddedLocale: merge(error, login),
  flags: ['FR'],
};
