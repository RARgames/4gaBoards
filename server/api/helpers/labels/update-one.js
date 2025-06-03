const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    const rawResult = await sails.sendNativeQuery(`SELECT * FROM label WHERE "board_id" = $1 AND LOWER("name") = LOWER($2) AND "id" <> $3 LIMIT 1`, [inputs.record.boardId, values.name, inputs.record.id]);
    const existingLabel = rawResult.rows[0] || null;
    if (existingLabel) {
      throw 'invalidName';
    }

    const label = await Label.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (label) {
      sails.sockets.broadcast(
        `board:${label.boardId}`,
        'labelUpdate',
        {
          item: label,
        },
        inputs.request,
      );
    }

    return label;
  },
};
