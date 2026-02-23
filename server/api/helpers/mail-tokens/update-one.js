const crypto = require('crypto');

const valuesValidator = (value) => {
  return _.isPlainObject(value) && typeof value.id === 'string';
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
    let mailToken;
    let newMailTokenToken;

    do {
      newMailTokenToken = crypto.randomBytes(8).toString('hex');
      /* eslint-disable-next-line no-await-in-loop */
      mailToken = await MailToken.findOne({ token: newMailTokenToken });
    } while (mailToken);

    const updated = await MailToken.updateOne({ id: inputs.values.id }).set({
      token: newMailTokenToken,
      updatedAt: new Date().toUTCString(),
    });

    if (updated) {
      sails.sockets.broadcast(
        `board:${updated.boardId}`,
        'mailTokenUpdate',
        {
          item: updated,
        },
        inputs.request,
      );
    }

    return updated;
  },
};
