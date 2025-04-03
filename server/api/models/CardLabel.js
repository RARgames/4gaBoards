/**
 * CardLabel.js
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
    labelId: {
      model: 'Label',
      required: true,
      columnName: 'label_id',
    },
  },

  tableName: 'card_label',

  async afterCreate(record, proceed) {
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
