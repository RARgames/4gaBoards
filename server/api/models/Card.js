/**
 * Card.js
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
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    dueDate: {
      type: 'ref',
      columnName: 'due_date',
    },
    timer: {
      type: 'json',
    },
    commentCount: {
      type: 'number',
      required: true,
      columnName: 'comment_count',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
    listId: {
      model: 'List',
      required: true,
      columnName: 'list_id',
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
    coverAttachmentId: {
      model: 'Attachment',
      columnName: 'cover_attachment_id',
    },
    subscriptionUsers: {
      collection: 'User',
      via: 'cardId',
      through: 'CardSubscription',
    },
    memberUsers: {
      collection: 'User',
      via: 'cardId',
      through: 'CardMembership',
    },
    labels: {
      collection: 'Label',
      via: 'cardId',
      through: 'CardLabel',
    },
    tasks: {
      collection: 'Task',
      via: 'cardId',
    },
    attachments: {
      collection: 'Attachment',
      via: 'cardId',
    },
    actions: {
      collection: 'Action',
      via: 'cardId',
    },
  },

  async afterCreate(record, proceed) {
    if (record.createdById) {
      const list = await List.updateOne(record.listId).set({ updatedAt: new Date().toUTCString(), updatedById: record.createdById });
      if (list) {
        sails.sockets.broadcast(`board:${list.boardId}`, 'listUpdate', {
          item: {
            id: list.id,
            updatedAt: list.updatedAt,
            updatedById: list.updatedById,
          },
        });
      }
    }
    proceed();
  },

  async afterUpdate(record, proceed) {
    if (record.updatedById) {
      const list = await List.updateOne(record.listId).set({ updatedAt: new Date().toUTCString(), updatedById: record.updatedById });
      if (list) {
        sails.sockets.broadcast(`board:${list.boardId}`, 'listUpdate', {
          item: {
            id: list.id,
            updatedAt: list.updatedAt,
            updatedById: list.updatedById,
          },
        });
      }
    }
    proceed();
  },
};
