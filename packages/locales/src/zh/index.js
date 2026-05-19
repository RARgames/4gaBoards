// Translated by FANJT2024
import { zhCN as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'zh',
  country: 'cn',
  name: '中文',
  embeddedLocale: merge(error, login),
  flags: ['CN'],
  dateFns,
  format: {
    date: 'yyyy.M.d',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
