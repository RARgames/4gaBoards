const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.board)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    invalidName: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    if (values.name === null || values.name === '') {
      throw 'invalidName';
    }
    // FUTURE check for name without case sensitivity - improve
    const rawResult = await sails.sendNativeQuery(`SELECT * FROM label WHERE "board_id" = $1 AND LOWER("name") = LOWER($2) LIMIT 1`, [values.board.id, values.name]);
    const existingLabel = rawResult.rows[0] || null;
    if (existingLabel) {
      throw 'invalidName';
    }

    const label = await Label.create({
      ...values,
      boardId: values.board.id,
      createdById: currentUser.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${label.boardId}`,
      'labelCreate',
      {
        item: label,
      },
      inputs.request,
    );

    return label;
  },
};
