import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* modalsWatchers() {
  yield all([takeEvery(EntryActionTypes.MODAL_OPEN, ({ payload: { type } }) => services.openModal(type)), takeEvery(EntryActionTypes.MODAL_CLOSE, () => services.closeModal())]);
}
