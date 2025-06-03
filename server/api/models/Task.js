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
    createdById: {
      model: 'User',
      required: true,
      columnName: 'created_by_id',
    },
    updatedById: {
      model: 'User',
      columnName: 'updated_by_id',
    },
  },

  async afterCreate(record, proceed) {
    if (record.createdById) {
      const card = await Card.updateOne(record.cardId).set({ updatedAt: new Date().toUTCString(), updatedById: record.createdById });
      if (card) {
        sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
          item: {
            id: card.id,
            updatedAt: card.updatedAt,
            updatedById: card.updatedById,
          },
        });
      }
    }
    proceed();
  },

  async afterUpdate(record, proceed) {
    if (record.updatedById) {
      const card = await Card.updateOne(record.cardId).set({ updatedAt: new Date().toUTCString(), updatedById: record.updatedById });
      if (card) {
        sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
          item: {
            id: card.id,
            updatedAt: card.updatedAt,
            updatedById: card.updatedById,
          },
        });
      }
    }
    proceed();
  },
};
