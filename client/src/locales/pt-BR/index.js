import merge from 'lodash/merge';

import core from './core';
import login from './login';

export default {
  language: 'pt-BR',
  country: 'br',
  name: 'Português',
  embeddedLocale: merge(login, core),
  flags: ['BR', 'PT'],
};
