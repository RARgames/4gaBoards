import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';
import { goToBoard, goToProject } from './router';

export function* createBoard(projectId, { import: boardImport, ...data }) {
  const nextData = {
    ...data,
    position: yield select(selectors.selectNextBoardPosition, projectId),
  };

  const localId = yield call(createLocalId);

  yield put(
    actions.createBoard({
      ...nextData,
      projectId,
      id: localId,
    }),
  );

  let board;
  let boardMemberships;

  try {
    ({
      item: board,
      included: { boardMemberships },
    } = yield boardImport
      ? call(
          request,
          api.createBoardWithImport,
          projectId,
          {
            ...nextData,
            importType: boardImport.type,
            importFile: boardImport.file,
          },
          localId,
        )
      : call(request, api.createBoard, projectId, nextData));
  } catch (error) {
    yield put(actions.createBoard.failure(localId, error));
    return;
  }

  yield put(actions.createBoard.success(localId, board, boardMemberships));
  yield call(goToBoard, board.id);
}

export function* createBoardInCurrentProject(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(createBoard, projectId, data);
}

export function* handleBoardCreate(board, requestId) {
  const isExists = yield select(selectors.selectIsBoardWithIdExists, requestId);

  if (!isExists) {
    yield put(actions.handleBoardCreate(board));
  }
}

export function* fetchBoard(id) {
  yield put(actions.fetchBoard(id));

  let board;
  let users;
  let projects;
  let boardMemberships;
  let labels;
  let lists;
  let mails;
  let cards;
  let cardMemberships;
  let cardLabels;
  let tasks;
  let taskMemberships;
  let attachments;

  try {
    ({
      item: board,
      included: { users, projects, boardMemberships, labels, lists, mails, cards, cardMemberships, cardLabels, tasks, taskMemberships, attachments },
    } = yield call(request, api.getBoard, id, true));
  } catch (error) {
    yield put(actions.fetchBoard.failure(id, error));
    return;
  }

  yield put(actions.fetchBoard.success(board, users, projects, boardMemberships, labels, lists, mails, cards, cardMemberships, cardLabels, tasks, taskMemberships, attachments));
}

export function* updateBoard(id, data) {
  yield put(actions.updateBoard(id, data));

  let board;
  try {
    ({ item: board } = yield call(request, api.updateBoard, id, data));
  } catch (error) {
    yield put(actions.updateBoard.failure(id, error));
    return;
  }

  yield put(actions.updateBoard.success(board));
}

export function* handleBoardUpdate(board) {
  yield put(actions.handleBoardUpdate(board));
}

export function* moveBoard(id, index) {
  const { projectId } = yield select(selectors.selectBoardById, id);
  const position = yield select(selectors.selectNextBoardPosition, projectId, index, id);

  yield call(updateBoard, id, {
    position,
  });
}

export function* deleteBoard(id) {
  const { boardId, projectId } = yield select(selectors.selectPath);

  if (id === boardId) {
    yield call(goToProject, projectId);
  }

  yield put(actions.deleteBoard(id));

  let board;
  try {
    ({ item: board } = yield call(request, api.deleteBoard, id));
  } catch (error) {
    yield put(actions.deleteBoard.failure(id, error));
    return;
  }

  yield put(actions.deleteBoard.success(board));
}

export function* handleBoardDelete(board) {
  const { boardId, projectId } = yield select(selectors.selectPath);

  if (board.id === boardId) {
    yield call(goToProject, projectId);
  }

  yield put(actions.handleBoardDelete(board));
}

export function* exportBoard(id, data) {
  yield put(actions.exportBoard(id, data));

  let downloadUrl;
  try {
    ({ item: downloadUrl } = yield call(request, api.exportBoard, id, data));
  } catch (error) {
    yield put(actions.exportBoard.failure(id, error));
    return;
  }

  yield put(actions.exportBoard.success(downloadUrl));
}

export function* updateBoardSearchParams(id, searchParams) {
  yield put(actions.updateBoardSearchParams(id, searchParams));
}

export default {
  createBoard,
  createBoardInCurrentProject,
  handleBoardCreate,
  fetchBoard,
  updateBoard,
  handleBoardUpdate,
  moveBoard,
  deleteBoard,
  handleBoardDelete,
  exportBoard,
  updateBoardSearchParams,
};
