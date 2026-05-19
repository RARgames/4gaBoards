import { fr as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'fr',
  country: 'fr',
  name: 'Français',
  embeddedLocale: merge(error, login),
  flags: ['FR'],
  dateFns,
  format: {
    date: 'd.MM.yyyy',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
