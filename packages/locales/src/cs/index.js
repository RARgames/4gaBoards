import { cs as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'cs',
  country: 'cz',
  name: 'Čeština',
  embeddedLocale: merge(error, login),
  flags: ['CZ'],
  dateFns,
  format: {
    date: 'd.MM.yyyy',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
