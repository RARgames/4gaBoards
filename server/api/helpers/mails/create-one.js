const valuesValidator = (value) => {
  return _.isPlainObject(value)
    && typeof value.mailId === 'string'
    && typeof value.userId === 'string'
    && typeof value.projectId === 'string'
    && typeof value.boardId === 'string'
    && typeof value.listId === 'string';
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const mail = await Mail.create(inputs.values).fetch();

    return mail;
  },
};
