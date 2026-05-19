// Translated by dacampsss
import { ptBR as dateFns } from 'date-fns/locale';
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'pt-BR',
  country: 'br',
  name: 'Português',
  embeddedLocale: merge(error, login),
  flags: ['BR', 'PT'],
  dateFns,
  format: {
    date: 'd/MM/yyyy',
    dateTime: '$t(format:date) $t(format:time)',
    time: 'HH:mm',
  },
};
