import { call, fork, join, put, select, take } from 'redux-saga/effects';

import actions from '../../actions';
import ErrorCodes from '../../constants/ErrorCodes';
import selectors from '../../selectors';
import { removeAccessToken } from '../../utils/access-token-storage';

let lastRequestTask;

function* queueRequest(method, ...args) {
  if (lastRequestTask) {
    try {
      yield join(lastRequestTask);
    } catch {} // eslint-disable-line no-empty
  }

  const accessToken = yield select(selectors.selectAccessToken);

  try {
    return yield call(method, ...args, {
      Authorization: `Bearer ${accessToken}`,
    });
  } catch (error) {
    if (error.code === ErrorCodes.UNAUTHORIZED) {
      yield call(removeAccessToken);
      yield put(actions.logout()); // TODO: next url
      yield take();
    }

    throw error;
  }
}

export default function* request(method, ...args) {
  lastRequestTask = yield fork(queueRequest, method, ...args);

  return yield join(lastRequestTask);
}
