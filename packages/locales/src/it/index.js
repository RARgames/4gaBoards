import { it as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'it',
  country: 'it',
  name: 'Italiano',
  embeddedLocale: merge(error, login),
  flags: ['IT'],
  dateFns,
  format: {
    date: 'dd.MM.yyyy',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
