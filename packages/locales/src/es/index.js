import { es as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'es',
  country: 'es',
  name: 'Español',
  embeddedLocale: merge(error, login),
  flags: ['ES'],
  dateFns,
  format: {
    date: 'd.MM.yyyy',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
