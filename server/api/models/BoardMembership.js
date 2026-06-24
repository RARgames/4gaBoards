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
    isSubscribed: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_subscribed',
    },
    hideCompletedLists: {
      type: 'boolean',
      allowNull: true,
      columnName: 'hide_completed_lists',
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

  customToJSON() {
    return {
      ...this,
      hideCompletedLists: this.hideCompletedLists === true,
    };
  },
};
