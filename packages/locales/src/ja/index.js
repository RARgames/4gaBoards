import { ja as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'ja',
  country: 'jp',
  name: '日本語',
  embeddedLocale: merge(error, login),
  flags: ['JP'],
  dateFns,
  format: {
    date: 'yyyy/MM/dd',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
