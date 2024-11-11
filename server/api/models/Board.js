/**
 * Board.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const ImportTypes = {
  BOARDS: '4gaBoards',
  TRELLO: 'trello',
};

module.exports = {
  ImportTypes,

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
    isGithubConnected: {
      type: 'boolean',
      required: true,
      columnName: 'is_github_connected',
    },
    githubRepo: {
      type: 'string',
      columnName: 'github_repo',
    },
    isImportedBoard: {
      type: 'boolean',
      required: true,
      columnName: 'is_imported_board',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
    memberUsers: {
      collection: 'User',
      via: 'boardId',
      through: 'BoardMembership',
    },
    lists: {
      collection: 'List',
      via: 'boardId',
    },
    labels: {
      collection: 'Label',
      via: 'boardId',
    },
  },
};
