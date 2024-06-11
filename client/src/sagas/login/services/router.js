import { call, put, select } from 'redux-saga/effects';
import { push } from '../../../lib/redux-router';
import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';
import { authenticateGoogleSsoCallback } from './login';

export function* goToLogin() {
  yield put(push(Paths.LOGIN));
}

export function* goToRoot() {
  yield put(push(Paths.ROOT));
}

export function* handleLocationChange() {
  const pathsMatch = yield select(selectors.selectPathsMatch);

  if (!pathsMatch) {
    return;
  }

  switch (pathsMatch.pattern.path) {
    case Paths.ROOT:
    case Paths.PROJECTS:
    case Paths.BOARDS:
    case Paths.CARDS:
    case Paths.SETTINGS:
    case Paths.SETTINGS_PROFILE:
    case Paths.SETTINGS_PREFERENCES:
    case Paths.SETTINGS_ACCOUNT:
    case Paths.SETTINGS_AUTHENTICATION:
    case Paths.SETTINGS_ABOUT:
    case Paths.SETTINGS_INSTANCE:
    case Paths.SETTINGS_USERS:
    case Paths.SETTINGS_PROJECT:
      yield call(goToLogin);

      break;
    case Paths.GOOGLE_CALLBACK: {
      yield call(authenticateGoogleSsoCallback);

      break;
    }
    default:
  }
}

export default {
  goToLogin,
  goToRoot,
  handleLocationChange,
};
