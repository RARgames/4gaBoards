import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'ja',
  country: 'jp',
  name: '日本語',
  embeddedLocale: merge(error, login),
  flags: ['JP'],
};
