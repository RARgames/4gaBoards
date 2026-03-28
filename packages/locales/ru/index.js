import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'ru',
  country: 'ru',
  name: 'Русский',
  embeddedLocale: merge(error, login),
  flags: ['RU'],
};
