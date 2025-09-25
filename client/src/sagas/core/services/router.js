import { call, put, select, take } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import ActionTypes from '../../../constants/ActionTypes';
import Paths from '../../../constants/Paths';
import { push, replace } from '../../../lib/redux-router';
import selectors from '../../../selectors';
import request from '../request';

export function* goToRoot() {
  yield put(push(Paths.ROOT));
}

export function* goToSettingsHome() {
  yield put(replace(Paths.SETTINGS_PROFILE));
}

export function* goToProject(projectId) {
  yield put(push(Paths.PROJECTS.replace(':id', projectId)));
}

export function* goToProjectSettings(projectId) {
  yield put(push(Paths.SETTINGS_PROJECT.replace(':id', projectId)));
}

export function* goToBoard(boardId) {
  yield put(push(Paths.BOARDS.replace(':id', boardId)));
}

export function* goToCard(cardId) {
  yield put(push(Paths.CARDS.replace(':id', cardId)));
}

export function* goToPath(path) {
  yield put(push(path));
}

export function* handleLocationChange() {
  const pathsMatch = yield select(selectors.selectPathsMatch);

  if (!pathsMatch) {
    return;
  }

  switch (pathsMatch.pattern.path) {
    case Paths.LOGIN:
    case Paths.REGISTER:
      yield call(goToRoot);
      break;
    case Paths.SETTINGS:
      yield call(goToSettingsHome);
      break;
    default:
  }

  const isCoreInitializing = yield select(selectors.selectIsCoreInitializing);

  if (isCoreInitializing) {
    yield take(ActionTypes.CORE_INITIALIZE);
  }

  let board;
  let users;
  let projects;
  let boardMemberships;
  let labels;
  let lists;
  let cards;
  let cardMemberships;
  let cardLabels;
  let tasks;
  let taskMemberships;
  let attachments;
  let notifications;

  switch (pathsMatch.pattern.path) {
    case Paths.BOARDS:
    case Paths.CARDS: {
      const currentBoard = yield select(selectors.selectCurrentBoard);

      if (currentBoard && currentBoard.isFetching === null) {
        yield put(actions.handleLocationChange.fetchBoard(currentBoard.id));

        try {
          ({
            item: board,
            included: { users, projects, boardMemberships, labels, lists, cards, cardMemberships, cardLabels, tasks, taskMemberships, attachments },
          } = yield call(request, api.getBoard, currentBoard.id, true));
        } catch {} // eslint-disable-line no-empty
      }

      if (pathsMatch.pattern.path === Paths.CARDS) {
        const notificationIds = yield select(selectors.selectNotificationIdsForCurrentCard);

        if (notificationIds && notificationIds.length > 0) {
          try {
            ({ items: notifications } = yield call(request, api.updateNotifications, notificationIds, {
              isRead: true,
            }));
          } catch {} // eslint-disable-line no-empty
        }
      }

      break;
    }
    default:
  }

  yield put(actions.handleLocationChange(board, users, projects, boardMemberships, labels, lists, cards, cardMemberships, cardLabels, tasks, taskMemberships, attachments, notifications));
}

export default {
  goToRoot,
  goToSettingsHome,
  goToProject,
  goToProjectSettings,
  goToBoard,
  goToCard,
  goToPath,
  handleLocationChange,
};
