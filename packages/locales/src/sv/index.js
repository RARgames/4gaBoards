import { sv as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'sv',
  country: 'se',
  name: 'Svenska',
  embeddedLocale: merge(error, login),
  flags: ['SE'],
  dateFns,
  format: {
    date: 'yyyy-MM-dd',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
