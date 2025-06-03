/**
 * Attachment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    dirname: {
      type: 'string',
      required: true,
    },
    filename: {
      type: 'string',
      required: true,
    },
    image: {
      type: 'json',
    },
    name: {
      type: 'string',
      required: true,
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

  customToJSON() {
    return {
      ..._.omit(this, ['dirname', 'filename', 'image.thumbnailsExtension']),
      url: `${sails.config.custom.attachmentsUrl}/${this.id}/download/${this.filename}`,
      coverUrl: this.image ? `${sails.config.custom.attachmentsUrl}/${this.id}/download/thumbnails/cover-256.${this.image.thumbnailsExtension}` : null,
    };
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
