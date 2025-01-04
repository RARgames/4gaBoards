import { transformAttachment } from './attachments';
import socket from './socket';
import { transformTask } from './tasks';

/* Transformers */

export const transformCard = (card) => ({
  ...card,
  ...(card.dueDate && {
    dueDate: new Date(card.dueDate),
  }),
  ...(card.timer && {
    timer: {
      ...card.timer,
      ...(card.timer.startedAt && {
        startedAt: new Date(card.timer.startedAt),
      }),
    },
  }),
});

export const transformCardData = (data) => ({
  ...data,
  ...(data.dueDate && {
    dueDate: data.dueDate.toISOString(),
  }),
  ...(data.timer && {
    timer: {
      ...data.timer,
      ...(data.timer.startedAt && {
        startedAt: data.timer.startedAt.toISOString(),
      }),
    },
  }),
});

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
  makeHandleCardCreate,
  makeHandleCardUpdate,
  makeHandleCardDelete,
  makeHandleCardDuplicate,
};
