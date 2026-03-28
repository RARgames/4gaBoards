// Translated by Park Seok Ho
import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'ko',
  country: 'kr',
  name: '한국어',
  embeddedLocale: merge(error, login),
  flags: ['KR'],
};
