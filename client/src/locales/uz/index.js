import merge from 'lodash/merge';

import error from './error';
import login from './login';

export default {
  language: 'uz',
  country: 'uz',
  name: "O'zbek",
  embeddedLocale: merge(error, login),
  flags: ['UZ'],
};
