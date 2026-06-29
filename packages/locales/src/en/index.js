import { enGB as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import activity from './activity';
import core from './core';
import error from './error';
import login from './login';

export default {
  language: 'en',
  country: 'gb',
  name: 'English',
  embeddedLocale: merge(activity, core, error, login),
  flags: ['GB', 'US'],
  dateFns,
  format: {
    date: 'd.MM.yyyy',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
