/**
 * Mail.js
 *
 * @description :: Model for mail ID entries.
 */

module.exports = {
  attributes: {
    mailId: {
      type: 'string',
      required: true,
      unique: true,
      columnName: 'mail_id',
    },

    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },

    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },

    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },

    listId: {
      model: 'List',
      columnName: 'list_id',
    },
  },
};
