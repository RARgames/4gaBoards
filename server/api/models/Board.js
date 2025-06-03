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
      const project = await Project.updateOne(record.projectId).set({ updatedAt: new Date().toUTCString(), updatedById: record.createdById });
      if (project) {
        const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(project.id);
        projectRelatedUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'projectUpdate', {
            item: {
              id: project.id,
              updatedAt: project.updatedAt,
              updatedById: project.updatedById,
            },
          });
        });
      }
    }
    proceed();
  },

  async afterUpdate(record, proceed) {
    if (record.updatedById) {
      const project = await Project.updateOne(record.projectId).set({ updatedAt: new Date().toUTCString(), updatedById: record.updatedById });
      if (project) {
        const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(project.id);
        projectRelatedUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'projectUpdate', {
            item: {
              id: project.id,
              updatedAt: project.updatedAt,
              updatedById: project.updatedById,
            },
          });
        });
      }
    }
    proceed();
  },
};
