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
  let projects2;
  let boardMemberships2;
  let labels;
  let lists;
  let cards1;
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
  }

  const core = yield call(request, api.getCoreSettingsPublic);
  const userProjects = yield call(request, api.getUserProjects);
  const userPrefs = yield call(request, api.getUserPrefs, user.id);

  return {
    user,
    board,
    projectManagers,
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
    users: mergeRecords(users1, users2, users3),
    projects: mergeRecords(projects1, projects2),
    boardMemberships: mergeRecords(boardMemberships1, boardMemberships2),
    cards: mergeRecords(cards1, cards2),
    core,
    userProjects: userProjects.items,
    userPrefs: userPrefs.item,
  };
}

export default {
  fetchCore,
};
