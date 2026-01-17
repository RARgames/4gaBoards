import { call } from 'redux-saga/effects';

import api from '../../../api';
import mergeRecords from '../../../utils/merge-records';
import request from '../request';
import { fetchBoardByCurrentPath } from './boards';

export function* fetchCore() {
  const { item: user } = yield call(request, api.getCurrentUser, true);
  const { items: users1 } = yield call(request, api.getUsers);

  const {
    items: projects1,
    included: { projectManagers, boards, boardMemberships: boardMemberships1 },
  } = yield call(request, api.getProjects);

  let board;
  let card;
  let users2;
  let users4;
  let projects2;
  let boardMemberships2;
  let labels;
  let lists;
  let cards1;
  let comments = [];
  let cardMemberships;
  let cardLabels;
  let tasks;
  let taskMemberships;
  let attachments;

  try {
    ({
      board,
      card,
      users: users2,
      projects: projects2,
      boardMemberships: boardMemberships2,
      labels,
      lists,
      cards: cards1,
      cardMemberships,
      cardLabels,
      tasks,
      taskMemberships,
      attachments,
    } = yield call(fetchBoardByCurrentPath));
  } catch {} // eslint-disable-line no-empty

  const body = yield call(request, api.getNotifications);

  const { items: notifications } = body;

  const {
    included: { users: users3, cards: cards2, activities },
  } = body;

  if (card) {
    const notificationIds = notifications.flatMap((notification) => (notification.cardId === card.id ? [notification.id] : []));

    if (notificationIds.length > 0) {
      yield call(request, api.updateNotifications, notificationIds, {
        isRead: true,
      });
    }

    ({
      items: comments,
      included: { users: users4 },
    } = yield call(request, api.getCardComments, card.id, {}));
  }

  const core = yield call(request, api.getCoreSettingsPublic);
  const { items: projectMemberships } = yield call(request, api.getProjectMemberships);
  const { item: userPrefs } = yield call(request, api.getUserPrefs, user.id);

  return {
    user,
    board,
    projectManagers,
    projectMemberships,
    boards,
    labels,
    lists,
    cardMemberships,
    cardLabels,
    tasks,
    taskMemberships,
    attachments,
    activities,
    notifications,
    users: mergeRecords(users1, users2, users3, users4),
    projects: mergeRecords(projects1, projects2),
    boardMemberships: mergeRecords(boardMemberships1, boardMemberships2),
    cards: mergeRecords(cards1, cards2),
    comments,
    core,
    userPrefs,
  };
}

export default {
  fetchCore,
};
