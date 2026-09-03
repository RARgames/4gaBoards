import ActionTypes from '../constants/ActionTypes';

const createCard = (card) => ({
  type: ActionTypes.CARD_CREATE,
  payload: {
    card,
  },
});

createCard.success = (localId, card) => ({
  type: ActionTypes.CARD_CREATE__SUCCESS,
  payload: {
    localId,
    card,
  },
});

createCard.failure = (localId, error) => ({
  type: ActionTypes.CARD_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleCardCreate = (card) => ({
  type: ActionTypes.CARD_CREATE_HANDLE,
  payload: {
    card,
  },
});

const fetchCard = (id) => ({
  type: ActionTypes.CARD_FETCH,
  payload: {
    id,
  },
});

fetchCard.success = (card, attachments) => ({
  type: ActionTypes.CARD_FETCH__SUCCESS,
  payload: {
    card,
    attachments,
  },
});

fetchCard.failure = (id, error) => ({
  type: ActionTypes.CARD_FETCH__FAILURE,
  payload: {
    id,
    error,
  },
});

const updateCard = (id, data) => ({
  type: ActionTypes.CARD_UPDATE,
  payload: {
    id,
    data,
  },
});

updateCard.success = (card) => ({
  type: ActionTypes.CARD_UPDATE__SUCCESS,
  payload: {
    card,
  },
});

updateCard.failure = (id, error) => ({
  type: ActionTypes.CARD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCardUpdate = (card) => ({
  type: ActionTypes.CARD_UPDATE_HANDLE,
  payload: {
    card,
  },
});

const deleteCard = (id) => ({
  type: ActionTypes.CARD_DELETE,
  payload: {
    id,
  },
});

deleteCard.success = (card) => ({
  type: ActionTypes.CARD_DELETE__SUCCESS,
  payload: {
    card,
  },
});

deleteCard.failure = (id, error) => ({
  type: ActionTypes.CARD_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCardDelete = (card) => ({
  type: ActionTypes.CARD_DELETE_HANDLE,
  payload: {
    card,
  },
});

const duplicateCard = (card) => ({
  type: ActionTypes.CARD_DUPLICATE,
  payload: {
    card,
  },
});

duplicateCard.success = (card, tasks, taskMemberships, attachments, cardMemberships, cardLabels, coverAttachmentId) => ({
  type: ActionTypes.CARD_DUPLICATE__SUCCESS,
  payload: {
    card,
    tasks,
    taskMemberships,
    attachments,
    cardMemberships,
    cardLabels,
    coverAttachmentId,
  },
});

duplicateCard.failure = (id, error) => ({
  type: ActionTypes.CARD_DUPLICATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCardDuplicate = (card) => ({
  type: ActionTypes.CARD_DUPLICATE_HANDLE,
  payload: {
    card,
  },
});

// §5.4: archive is a card update in disguise (it only stamps archivedAt), but it gets its own
// action so the optimistic reducer knows to drop the card from the board straight away.
const archiveCard = (id) => ({
  type: ActionTypes.CARD_ARCHIVE,
  payload: {
    id,
  },
});

archiveCard.success = (card) => ({
  type: ActionTypes.CARD_ARCHIVE__SUCCESS,
  payload: {
    card,
  },
});

archiveCard.failure = (id, error) => ({
  type: ActionTypes.CARD_ARCHIVE__FAILURE,
  payload: {
    id,
    error,
  },
});

// Restore is the inverse of archive, but it can also move the card into an `active` list and
// clear completedAt server-side, so the success payload is upserted whole — the card may not
// even be in the store yet (the board fetch skipped it while it was archived).
const unarchiveCard = (id) => ({
  type: ActionTypes.CARD_UNARCHIVE,
  payload: {
    id,
  },
});

unarchiveCard.success = (card) => ({
  type: ActionTypes.CARD_UNARCHIVE__SUCCESS,
  payload: {
    card,
  },
});

unarchiveCard.failure = (id, error) => ({
  type: ActionTypes.CARD_UNARCHIVE__FAILURE,
  payload: {
    id,
    error,
  },
});

export default {
  createCard,
  handleCardCreate,
  fetchCard,
  updateCard,
  handleCardUpdate,
  deleteCard,
  handleCardDelete,
  duplicateCard,
  handleCardDuplicate,
  archiveCard,
  unarchiveCard,
};
