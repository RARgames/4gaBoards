import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* createBoardTemplate(boardId, data) {
  yield put(actions.createBoardTemplate(data));

  let boardTemplate;
  try {
    ({ item: boardTemplate } = yield call(request, api.createBoardTemplate, boardId, data));
  } catch (error) {
    yield put(actions.createBoardTemplate.failure(error));
    return;
  }

  yield put(actions.createBoardTemplate.success(boardTemplate));
}

export function* handleBoardTemplateCreate(boardTemplate) {
  yield put(actions.handleBoardTemplateCreate(boardTemplate));
}

export function* updateBoardTemplate(id, data) {
  yield put(actions.updateBoardTemplate(id, data));

  let boardTemplate;
  try {
    ({ item: boardTemplate } = yield call(request, api.updateBoardTemplate, id, data));
  } catch (error) {
    yield put(actions.updateBoardTemplate.failure(id, error));
    return;
  }

  yield put(actions.updateBoardTemplate.success(boardTemplate));
}

export function* handleBoardTemplateUpdate(boardTemplate) {
  yield put(actions.handleBoardTemplateUpdate(boardTemplate));
}

export function* deleteBoardTemplate(id) {
  yield put(actions.deleteBoardTemplate(id));

  let boardTemplate;
  try {
    ({ item: boardTemplate } = yield call(request, api.deleteBoardTemplate, id));
  } catch (error) {
    yield put(actions.deleteBoardTemplate.failure(id, error));
    return;
  }

  yield put(actions.deleteBoardTemplate.success(boardTemplate));
}

export function* handleBoardTemplateDelete(boardTemplate) {
  yield put(actions.handleBoardTemplateDelete(boardTemplate));
}

export default {
  createBoardTemplate,
  handleBoardTemplateCreate,
  updateBoardTemplate,
  handleBoardTemplateUpdate,
  deleteBoardTemplate,
  handleBoardTemplateDelete,
};
