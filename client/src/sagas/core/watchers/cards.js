import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* cardsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CARD_CREATE, ({ payload: { listId, data, autoOpen, index } }) => services.createCard(listId, data, autoOpen, index)),
    takeEvery(EntryActionTypes.CARD_CREATE_HANDLE, ({ payload: { card } }) => services.handleCardCreate(card)),
    takeEvery(EntryActionTypes.CARD_FETCH, ({ payload: { id } }) => services.fetchCard(id)),
    takeEvery(EntryActionTypes.CARD_UPDATE, ({ payload: { id, data } }) => services.updateCard(id, data)),
    takeEvery(EntryActionTypes.CURRENT_CARD_UPDATE, ({ payload: { data } }) => services.updateCurrentCard(data)),
    takeEvery(EntryActionTypes.CARD_UPDATE_HANDLE, ({ payload: { card } }) => services.handleCardUpdate(card)),
    takeEvery(EntryActionTypes.CARD_MOVE, ({ payload: { id, listId, index } }) => services.moveCard(id, listId, index)),
    takeEvery(EntryActionTypes.CURRENT_CARD_MOVE, ({ payload: { listId, index } }) => services.moveCurrentCard(listId, index)),
    takeEvery(EntryActionTypes.CARD_MOVE_TO_SWIMLANE, ({ payload: { id, listId, laneId, index } }) => services.moveCardToSwimlane(id, listId, laneId, index)),
    takeEvery(EntryActionTypes.CARD_TRANSFER, ({ payload: { id, boardId, listId, index } }) => services.transferCard(id, boardId, listId, index)),
    takeEvery(EntryActionTypes.CURRENT_CARD_TRANSFER, ({ payload: { boardId, listId, index } }) => services.transferCurrentCard(boardId, listId, index)),
    takeEvery(EntryActionTypes.CARD_DUPLICATE, ({ payload: { id } }) => services.duplicateCard(id)),
    takeEvery(EntryActionTypes.CURRENT_CARD_DUPLICATE, () => services.duplicateCurrentCard()),
    takeEvery(EntryActionTypes.CARD_DUPLICATE_HANDLE, ({ payload: { card } }) => services.handleCardDuplicate(card)),
    takeEvery(EntryActionTypes.CARD_DELETE, ({ payload: { id } }) => services.deleteCard(id)),
    takeEvery(EntryActionTypes.CURRENT_CARD_DELETE, () => services.deleteCurrentCard()),
    takeEvery(EntryActionTypes.CARD_DELETE_HANDLE, ({ payload: { card } }) => services.handleCardDelete(card)),
    takeEvery(EntryActionTypes.CARD_ARCHIVE, ({ payload: { id } }) => services.archiveCard(id)),
    takeEvery(EntryActionTypes.CURRENT_CARD_ARCHIVE, () => services.archiveCurrentCard()),
    takeEvery(EntryActionTypes.CARD_UNARCHIVE, ({ payload: { id } }) => services.unarchiveCard(id)),
    takeEvery(EntryActionTypes.CARDS_UPDATE, ({ payload: { ids, data } }) => services.updateCards(ids, data)),
    takeEvery(EntryActionTypes.CARDS_MOVE, ({ payload: { ids, listId } }) => services.moveCards(ids, listId)),
    takeEvery(EntryActionTypes.CARDS_TRANSFER, ({ payload: { ids, boardId, listId } }) => services.transferCards(ids, boardId, listId)),
    takeEvery(EntryActionTypes.CARDS_ARCHIVE, ({ payload: { ids } }) => services.archiveCards(ids)),
    takeEvery(EntryActionTypes.CARDS_DELETE, ({ payload: { ids } }) => services.deleteCards(ids)),
  ]);
}
