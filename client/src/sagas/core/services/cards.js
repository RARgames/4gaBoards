import { call, fork, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import { UNASSIGNED_LANE_ID } from '../../../utils/swimlane-helpers';
import request from '../request';
import { addLabelToCard } from './labels';
import { goToBoard, goToCard } from './router';
import { addUserToCard, removeUserFromCard } from './users';

let descriptionOpenHandler = null;

export const registerDescriptionOpenHandler = (fn) => {
  descriptionOpenHandler = fn;
};

export function* createCard(listId, data, autoOpen, index) {
  const { boardId } = yield select(selectors.selectListById, listId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextCardPosition, listId, index),
  };

  const localId = yield call(createLocalId);

  yield put(
    actions.createCard({
      ...nextData,
      boardId,
      listId,
      id: localId,
    }),
  );

  let card;
  try {
    ({ item: card } = yield call(request, api.createCard, listId, nextData));
  } catch (error) {
    yield put(actions.createCard.failure(localId, error));
    return;
  }

  yield put(actions.createCard.success(localId, card));

  if (nextData.labelIds) {
    // eslint-disable-next-line no-restricted-syntax
    for (const labelId of nextData.labelIds) {
      yield call(addLabelToCard, labelId, card.id);
    }
  }

  if (nextData.userIds) {
    // eslint-disable-next-line no-restricted-syntax
    for (const userId of nextData.userIds) {
      yield call(addUserToCard, userId, card.id);
    }
  }

  if (autoOpen) {
    yield call(goToCard, card.id);
    setTimeout(() => {
      if (typeof descriptionOpenHandler === 'function') {
        descriptionOpenHandler();
      }
    }, 0);
  }
}

export function* handleCardCreate(card) {
  yield put(actions.handleCardCreate(card));
}

export function* fetchCard(id) {
  yield put(actions.fetchCard(id));

  let card;
  let attachments;
  try {
    ({
      item: card,
      included: { attachments },
    } = yield call(request, api.getCard, id));
  } catch (error) {
    yield put(actions.fetchCard.failure(id, error));
    return;
  }

  yield put(actions.fetchCard.success(card, attachments));
}

export function* updateCard(id, data) {
  yield put(actions.updateCard(id, data));

  let card;
  try {
    ({ item: card } = yield call(request, api.updateCard, id, data));
  } catch (error) {
    yield put(actions.updateCard.failure(id, error));
    return;
  }

  yield put(actions.updateCard.success(card));
}

export function* updateCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(updateCard, cardId, data);
}

// TODO: handle card transfer
export function* handleCardUpdate(card) {
  yield put(actions.handleCardUpdate(card));
}

export function* moveCard(id, listId, index) {
  const position = yield select(selectors.selectNextCardPosition, listId, index, id, true);

  yield call(updateCard, id, {
    listId,
    position,
  });
}

export function* moveCurrentCard(listId, index) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(moveCard, cardId, listId, index);
}

// A card's lane is its most recently assigned member, so making the target user primary
// means recreating their membership. The server rejects duplicate memberships, so the
// remove must complete before the add.
function* reassignUserToCard(userId, cardId) {
  yield call(removeUserFromCard, userId, cardId);
  yield call(addUserToCard, userId, cardId);
}

// Swimlane drag-drop: `index` is the position within the destination (list, lane) cell.
// Reassigns the primary user when the lane changes, then translates the cell index into a
// list position using the same convention as a normal card move.
export function* moveCardToSwimlane(id, listId, laneId, index) {
  const currentLaneId = yield select(selectors.selectPrimaryUserIdByCardId, id);

  // The dragged card is excluded from both arrays: nextPosition computes against the list
  // without the moved card, so the anchor's index must be taken in that same space.
  const laneCardIds = (yield select(selectors.selectFilteredCardIdsByListIdAndLane, listId, laneId)).filter((cardId) => cardId !== id);
  const listCardIds = (yield select(selectors.selectFilteredCardIdsByListId, listId)).filter((cardId) => cardId !== id);

  const anchorCardId = laneCardIds[index];
  let listIndex;
  if (anchorCardId) {
    listIndex = listCardIds.indexOf(anchorCardId);
  } else if (laneCardIds.length > 0) {
    listIndex = listCardIds.indexOf(laneCardIds[laneCardIds.length - 1]) + 1;
  } else {
    listIndex = listCardIds.length;
  }

  // Fork the membership changes so their optimistic updates land in the same tick as the
  // position update; awaiting the API round trips here made the card hop between lanes.
  if (currentLaneId !== laneId) {
    if (currentLaneId !== UNASSIGNED_LANE_ID) {
      yield fork(removeUserFromCard, currentLaneId, id);
    }
    if (laneId !== UNASSIGNED_LANE_ID) {
      const cardUsers = yield select(selectors.selectUsersByCardId, id);
      const isAlreadyMember = cardUsers.some((user) => user.id === laneId);

      if (isAlreadyMember) {
        yield fork(reassignUserToCard, laneId, id);
      } else {
        yield fork(addUserToCard, laneId, id);
      }
    }
  }

  yield call(moveCard, id, listId, listIndex);
}

// eslint-disable-next-line no-unused-vars
export function* transferCard(id, boardId, listId, index) {
  const { cardId: currentCardId, boardId: currentBoardId } = yield select(selectors.selectPath);
  const position = yield select(selectors.selectNextCardPosition, listId, undefined, id); // index = undefined for last position in list after transfer

  if (id === currentCardId) {
    yield call(goToBoard, currentBoardId);
  }

  yield call(updateCard, id, {
    boardId,
    listId,
    position,
  });
}

export function* transferCurrentCard(boardId, listId, index) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(transferCard, cardId, boardId, listId, index);
}

export function* duplicateCard(id) {
  yield put(actions.duplicateCard(id));

  let card;
  let tasks;
  let taskMemberships;
  let attachments;
  let cardMemberships;
  let cardLabels;
  let coverAttachmentId;
  try {
    ({
      item: card,
      included: { tasks, taskMemberships, attachments, cardMemberships, cardLabels, coverAttachmentId },
    } = yield call(request, api.duplicateCard, id));
  } catch (error) {
    yield put(actions.duplicateCard.failure(id, error));
    return;
  }

  yield put(actions.duplicateCard.success(card, tasks, taskMemberships, attachments, cardMemberships, cardLabels, coverAttachmentId));
}

export function* duplicateCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(duplicateCard, cardId);
}

export function* handleCardDuplicate(card) {
  yield put(actions.handleCardDuplicate(card));
}

export function* deleteCard(id) {
  const { cardId, boardId } = yield select(selectors.selectPath);

  if (id === cardId) {
    yield call(goToBoard, boardId);
  }

  yield put(actions.deleteCard(id));

  let card;
  try {
    ({ item: card } = yield call(request, api.deleteCard, id));
  } catch (error) {
    yield put(actions.deleteCard.failure(id, error));
    return;
  }

  yield put(actions.deleteCard.success(card));
}

export function* deleteCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(deleteCard, cardId);
}

export function* handleCardDelete(card) {
  const { cardId, boardId } = yield select(selectors.selectPath);

  if (card.id === cardId) {
    yield call(goToBoard, boardId);
  }

  yield put(actions.handleCardDelete(card));
}

// §5.4: manual archive. The card stays on the server (with archivedAt stamped) but leaves the
// board — boards/show.js excludes it — so the reducer drops it from the lists optimistically and
// puts it back if the request fails.
export function* archiveCard(id) {
  const { cardId, boardId } = yield select(selectors.selectPath);

  if (id === cardId) {
    yield call(goToBoard, boardId);
  }

  yield put(actions.archiveCard(id));

  let card;
  try {
    ({ item: card } = yield call(request, api.archiveCard, id));
  } catch (error) {
    yield put(actions.archiveCard.failure(id, error));
    return;
  }

  yield put(actions.archiveCard.success(card));
}

// The card is not in the store while it is archived, so there is nothing to update
// optimistically — it appears on the board when the server confirms.
export function* unarchiveCard(id) {
  yield put(actions.unarchiveCard(id));

  let card;
  try {
    ({ item: card } = yield call(request, api.unarchiveCard, id));
  } catch (error) {
    yield put(actions.unarchiveCard.failure(id, error));
    return;
  }

  yield put(actions.unarchiveCard.success(card));
}

export function* archiveCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(archiveCard, cardId);
}

/* Bulk actions on a multi-selection. Each one drives the existing single-card service per id —
   sequentially, so position-dependent moves stay deterministic — and clears the selection at the
   end, since every card it acted on has either left the board or is no longer where it was. */

export function* updateCards(ids, data) {
  // eslint-disable-next-line no-restricted-syntax
  for (const id of ids) {
    yield call(updateCard, id, data);
  }

  yield put(actions.clearCardSelection());
}

export function* moveCards(ids, listId) {
  // eslint-disable-next-line no-restricted-syntax
  for (const id of ids) {
    yield call(moveCard, id, listId);
  }

  yield put(actions.clearCardSelection());
}

export function* transferCards(ids, boardId, listId) {
  // eslint-disable-next-line no-restricted-syntax
  for (const id of ids) {
    yield call(transferCard, id, boardId, listId);
  }

  yield put(actions.clearCardSelection());
}

export function* archiveCards(ids) {
  // eslint-disable-next-line no-restricted-syntax
  for (const id of ids) {
    yield call(archiveCard, id);
  }

  yield put(actions.clearCardSelection());
}

export function* deleteCards(ids) {
  // eslint-disable-next-line no-restricted-syntax
  for (const id of ids) {
    yield call(deleteCard, id);
  }

  yield put(actions.clearCardSelection());
}

export default {
  registerDescriptionOpenHandler,
  createCard,
  handleCardCreate,
  fetchCard,
  updateCard,
  updateCurrentCard,
  moveCard,
  moveCurrentCard,
  moveCardToSwimlane,
  transferCard,
  transferCurrentCard,
  handleCardUpdate,
  duplicateCard,
  duplicateCurrentCard,
  handleCardDuplicate,
  deleteCard,
  deleteCurrentCard,
  handleCardDelete,
  archiveCard,
  unarchiveCard,
  archiveCurrentCard,
  updateCards,
  moveCards,
  transferCards,
  archiveCards,
  deleteCards,
};
