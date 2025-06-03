/**
 * CardMembership.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

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
    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
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

  tableName: 'card_membership',

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
