/**
 * MailToken.js
 *
 * @description :: Model for mail token entries.
 */

module.exports = {
  attributes: {
    token: {
      type: 'string',
      required: true,
      unique: true,
      columnName: 'token',
    },
    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
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

  tableName: 'mail_token',
};
