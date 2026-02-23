/**
 * MailToken.js
 *
 * @description :: Model for mail token entries.
 */

const validateInputs = async (values, proceed) => {
  const hasBoard = values.boardId;
  const hasList = values.listId;

  if (hasBoard === hasList) {
    return proceed(Error('One of boardId, listId is required, but not both'));
  }
  return proceed();
};

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
      columnName: 'board_id',
    },
    listId: {
      model: 'List',
      columnName: 'list_id',
    },
  },

  tableName: 'mail_token',

  beforeCreate(record, proceed) {
    sails.config.models.beforeCreate(record, async () => {
      await validateInputs(record, proceed);
    });
  },
  beforeUpdate(record, proceed) {
    sails.config.models.beforeUpdate(record, async () => {
      await validateInputs(record, proceed);
    });
  },
};
