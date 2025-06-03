/**
 * BoardMembership.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Roles = {
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

module.exports = {
  Roles,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    role: {
      type: 'string',
      isIn: Object.values(Roles),
      required: true,
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
      columnName: 'can_comment',
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

  tableName: 'board_membership',

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
