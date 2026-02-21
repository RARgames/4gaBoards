import { call, select } from 'redux-saga/effects';

import api from '../../../api';
import Paths from '../../../constants/Paths';
import selectors from '../../../selectors';
import request from '../request';

export function* fetchBoardByCurrentPath() {
  const pathsMatch = yield select(selectors.selectPathsMatch);

  let board;
  let card;
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

  if (pathsMatch) {
    let boardId;
    if (pathsMatch.pattern.path === Paths.BOARDS) {
      boardId = pathsMatch.params.id;
    } else if (pathsMatch.pattern.path === Paths.CARDS) {
      ({
        item: card,
        item: { boardId },
      } = yield call(request, api.getCard, pathsMatch.params.id));
    }

    if (boardId) {
      ({
        item: board,
        included: { users, projects, boardMemberships, labels, lists, mails, cards, cardMemberships, cardLabels, tasks, taskMemberships, attachments },
      } = yield call(request, api.getBoard, boardId, true));
    }
  }

  return {
    board,
    card,
    users,
    boardMemberships,
    labels,
    lists,
    mails,
    cards,
    cardMemberships,
    cardLabels,
    tasks,
    taskMemberships,
    attachments,
    project: projects[0],
  };
}

export default {
  fetchBoardByCurrentPath,
};
