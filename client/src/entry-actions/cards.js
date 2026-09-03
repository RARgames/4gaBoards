import EntryActionTypes from '../constants/EntryActionTypes';

const createCard = (listId, data, autoOpen, index) => ({
  type: EntryActionTypes.CARD_CREATE,
  payload: {
    listId,
    data,
    autoOpen,
    index,
  },
});

const handleCardCreate = (card) => ({
  type: EntryActionTypes.CARD_CREATE_HANDLE,
  payload: {
    card,
  },
});

const fetchCard = (id) => ({
  type: EntryActionTypes.CARD_FETCH,
  payload: {
    id,
  },
});

const updateCard = (id, data) => ({
  type: EntryActionTypes.CARD_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentCard = (data) => ({
  type: EntryActionTypes.CURRENT_CARD_UPDATE,
  payload: {
    data,
  },
});

const handleCardUpdate = (card) => ({
  type: EntryActionTypes.CARD_UPDATE_HANDLE,
  payload: {
    card,
  },
});

const moveCard = (id, listId, index = 0) => ({
  type: EntryActionTypes.CARD_MOVE,
  payload: {
    id,
    listId,
    index,
  },
});

const moveCurrentCard = (listId, index = 0) => ({
  type: EntryActionTypes.CURRENT_CARD_MOVE,
  payload: {
    listId,
    index,
  },
});

const moveCardToSwimlane = (id, listId, laneId, index = 0) => ({
  type: EntryActionTypes.CARD_MOVE_TO_SWIMLANE,
  payload: {
    id,
    listId,
    laneId,
    index,
  },
});

const transferCard = (id, boardId, listId, index = 0) => ({
  type: EntryActionTypes.CARD_TRANSFER,
  payload: {
    id,
    boardId,
    listId,
    index,
  },
});

const transferCurrentCard = (boardId, listId, index = 0) => ({
  type: EntryActionTypes.CURRENT_CARD_TRANSFER,
  payload: {
    boardId,
    listId,
    index,
  },
});

const duplicateCard = (id) => ({
  type: EntryActionTypes.CARD_DUPLICATE,
  payload: {
    id,
  },
});

const duplicateCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_CARD_DUPLICATE,
  payload: {},
});

const handleCardDuplicate = (card) => ({
  type: EntryActionTypes.CARD_DUPLICATE_HANDLE,
  payload: {
    card,
  },
});

const deleteCard = (id) => ({
  type: EntryActionTypes.CARD_DELETE,
  payload: {
    id,
  },
});

const deleteCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_CARD_DELETE,
  payload: {},
});

const handleCardDelete = (card) => ({
  type: EntryActionTypes.CARD_DELETE_HANDLE,
  payload: {
    card,
  },
});

const archiveCard = (id) => ({
  type: EntryActionTypes.CARD_ARCHIVE,
  payload: {
    id,
  },
});

const unarchiveCard = (id) => ({
  type: EntryActionTypes.CARD_UNARCHIVE,
  payload: {
    id,
  },
});

const archiveCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_CARD_ARCHIVE,
  payload: {},
});

/* Bulk actions on a multi-selection — each one fans out over the single-card service */

const updateCards = (ids, data) => ({
  type: EntryActionTypes.CARDS_UPDATE,
  payload: {
    ids,
    data,
  },
});

const moveCards = (ids, listId) => ({
  type: EntryActionTypes.CARDS_MOVE,
  payload: {
    ids,
    listId,
  },
});

const transferCards = (ids, boardId, listId) => ({
  type: EntryActionTypes.CARDS_TRANSFER,
  payload: {
    ids,
    boardId,
    listId,
  },
});

const archiveCards = (ids) => ({
  type: EntryActionTypes.CARDS_ARCHIVE,
  payload: {
    ids,
  },
});

const deleteCards = (ids) => ({
  type: EntryActionTypes.CARDS_DELETE,
  payload: {
    ids,
  },
});

export default {
  createCard,
  handleCardCreate,
  fetchCard,
  updateCard,
  updateCurrentCard,
  handleCardUpdate,
  moveCard,
  moveCurrentCard,
  moveCardToSwimlane,
  transferCard,
  transferCurrentCard,
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
