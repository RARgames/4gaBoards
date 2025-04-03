/**
 * Task.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    isCompleted: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_completed',
    },
    dueDate: {
      type: 'ref',
      columnName: 'due_date',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
    memberUsers: {
      collection: 'User',
      via: 'taskId',
      through: 'TaskMembership',
    },
  },

  async afterCreate(record, proceed) {
    const [card] = await Card.update({ id: record.cardId }).set({ updatedAt: new Date().toUTCString() }).fetch();
    if (card) {
      sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', { item: card });
    }
    proceed();
  },

  async afterUpdate(record, proceed) {
    const [card] = await Card.update({ id: record.cardId }).set({ updatedAt: new Date().toUTCString() }).fetch();
    if (card) {
      sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', { item: card });
    }
    proceed();
  },

  async afterDestroy(record, proceed) {
    const [card] = await Card.update({ id: record.cardId }).set({ updatedAt: new Date().toUTCString() }).fetch();
    if (card) {
      sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', { item: card });
    }
    proceed();
  },
};
