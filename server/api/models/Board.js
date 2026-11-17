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
    background: {
      type: 'json',
    },
    backgroundImage: {
      type: 'json',
      columnName: 'background_image',
    },
    thumbnail: {
      type: 'json',
    },
    thumbnailImage: {
      type: 'json',
      columnName: 'thumbnail_image',
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

  customToJSON() {
    return {
      ..._.omit(this, ['backgroundImage', 'thumbnailImage']),
      backgroundImage: this.backgroundImage && {
        url: `${sails.config.custom.projectBackgroundImagesUrl}/${this.backgroundImage.dirname}/original.${this.backgroundImage.extension}`,
        coverUrl: `${sails.config.custom.projectBackgroundImagesUrl}/${this.backgroundImage.dirname}/cover-336.${this.backgroundImage.extension}`,
      },
      thumbnailImage: this.thumbnailImage && {
        url: `${sails.config.custom.projectBackgroundImagesUrl}/${this.thumbnailImage.dirname}/original.${this.thumbnailImage.extension}`,
        coverUrl: `${sails.config.custom.projectBackgroundImagesUrl}/${this.thumbnailImage.dirname}/cover-336.${this.thumbnailImage.extension}`,
      },
    };
  },
};
