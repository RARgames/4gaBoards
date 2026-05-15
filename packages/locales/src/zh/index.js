// Translated by FANJT2024
// Updated by solider245 — added action, activity, core imports
import merge from 'lodash/merge';

import action from './action';
import activity from './activity';
import core from './core';
import error from './error';
import login from './login';

export default {
  language: 'zh',
  country: 'cn',
  name: '中文',
  embeddedLocale: merge(action, activity, core, error, login),
  flags: ['CN'],
};
