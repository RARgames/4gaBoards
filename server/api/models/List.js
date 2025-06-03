/**
 * List.js
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
    isCollapsed: {
      type: 'boolean',
      required: true,
      columnName: 'is_collapsed',
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
    cards: {
      collection: 'Card',
      via: 'listId',
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
      const board = await Board.updateOne(record.boardId).set({ updatedAt: new Date().toUTCString(), updatedById: record.createdById });
      if (board) {
        const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(board.projectId);
        const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(board.id);
        const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

        boardRelatedUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
            item: {
              id: board.id,
              updatedAt: board.updatedAt,
              updatedById: board.updatedById,
            },
          });
        });
      }
    }
    proceed();
  },

  async afterUpdate(record, proceed) {
    if (record.updatedById) {
      const board = await Board.updateOne(record.boardId).set({ updatedAt: new Date().toUTCString(), updatedById: record.updatedById });
      if (board) {
        const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(board.projectId);
        const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(board.id);
        const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

        boardRelatedUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
            item: {
              id: board.id,
              updatedAt: board.updatedAt,
              updatedById: board.updatedById,
            },
          });
        });
      }
    }
    proceed();
  },
};
