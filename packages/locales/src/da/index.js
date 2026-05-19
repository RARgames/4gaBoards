import { da as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'da',
  country: 'dk',
  name: 'Dansk',
  embeddedLocale: merge(error, login),
  flags: ['DK'],
  dateFns,
  format: {
    date: 'd.MM.yyyy',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
