// Translated by FANJT2024
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'zh',
  country: 'cn',
  name: '中文',
  embeddedLocale: merge(error, login),
  flags: ['CN'],
};
