import merge from 'lodash/merge';

import core from './core';
import login from './login';

export default {
  language: 'pt',
  country: 'br',
  name: 'Português',
  embeddedLocale: merge(login, core),
  flags: ['PT', 'BR'],
};
