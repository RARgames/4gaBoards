/**
 * Label.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const COLORS = [
  'berry-red',
  'pumpkin-orange',
  'lagoon-blue',
  'pink-tulip',
  'light-mud',
  'orange-peel',
  'bright-moss',
  'antique-blue',
  'dark-granite',
  'lagune-blue',
  'sunny-grass',
  'morning-sky',
  'light-orange',
  'midnight-blue',
  'tank-green',
  'gun-metal',
  'wet-moss',
  'red-burgundy',
  'light-concrete',
  'apricot-red',
  'desert-sand',
  'navy-blue',
  'egg-yellow',
  'coral-green',
  'light-cocoa',
];

module.exports = {
  COLORS,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: COLORS,
      required: true,
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
      via: 'labelId',
      through: 'CardLabel',
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
