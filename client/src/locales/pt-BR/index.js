// Translated by dacampsss
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'pt-BR',
  country: 'br',
  name: 'Português',
  embeddedLocale: merge(error, login),
  flags: ['BR', 'PT'],
};
