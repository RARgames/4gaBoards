import socket from './socket';
import { transformAttachment, transformCard, transformCardData, transformTask } from './transformers';

/* Actions */

const createCard = (listId, data, headers) =>
  socket.post(`/lists/${listId}/cards`, transformCardData(data), headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const getCard = (id, headers) =>
  socket.get(`/cards/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
    included: {
      ...body.included,
      attachments: body.included.attachments.map(transformAttachment),
      tasks: body.included.tasks.map(transformTask),
    },
  }));

const updateCard = (id, data, headers) =>
  socket.patch(`/cards/${id}`, transformCardData(data), headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const deleteCard = (id, headers) =>
  socket.delete(`/cards/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const duplicateCard = (id, headers) =>
  socket.post(`/cards/${id}/duplicate`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
    included: {
      ...body.included,
      attachments: body.included.attachments.map(transformAttachment),
      tasks: body.included.tasks.map(transformTask),
    },
  }));

// §5.4: manual archive/restore. The board fetch excludes cards matching the archived
// predicate, so the client drops archived cards from the board the same way.
const archiveCard = (id, headers) =>
  socket.post(`/cards/${id}/archive`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const unarchiveCard = (id, headers) =>
  socket.post(`/cards/${id}/unarchive`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const getCardTimeEntries = (id, headers) => socket.get(`/cards/${id}/time-entries`, undefined, headers);

const searchCards = (q, headers) => socket.get('/cards/search', { q }, headers);

// Creates a card at the end of a list and assigns the creator to it, for the Timesheet's ticket
// picker — see server/api/controllers/cards/create-and-assign.js for why this isn't createCard.
const createAndAssignCard = (listId, name, headers) => socket.post(`/lists/${listId}/cards/create-and-assign`, { name }, headers);

/* Event handlers */

const makeHandleCardCreate = (next) => (body) => {
  next({
    ...body,
    item: transformCard(body.item),
  });
};

const makeHandleCardUpdate = makeHandleCardCreate;

const makeHandleCardDelete = makeHandleCardCreate;

const makeHandleCardDuplicate = makeHandleCardCreate;

export default {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  duplicateCard,
  archiveCard,
  unarchiveCard,
  getCardTimeEntries,
  searchCards,
  createAndAssignCard,
  makeHandleCardCreate,
  makeHandleCardUpdate,
  makeHandleCardDelete,
  makeHandleCardDuplicate,
};
