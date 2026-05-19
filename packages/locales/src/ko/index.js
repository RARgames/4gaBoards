// Translated by Park Seok Ho
import { ko as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'ko',
  country: 'kr',
  name: '한국어',
  embeddedLocale: merge(error, login),
  flags: ['KR'],
  dateFns,
  format: {
    date: 'yyyy.MM.dd',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
