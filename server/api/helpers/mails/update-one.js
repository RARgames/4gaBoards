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
    let mail;
    let newMailId;

    do {
      newMailId = crypto.randomBytes(8).toString('hex');
      /* eslint-disable-next-line no-await-in-loop */
      mail = await Mail.findOne({ mailId: newMailId });
    } while (mail);

    const updated = await Mail.updateOne({ id: inputs.values.id }).set({
      mailId: newMailId,
      updatedAt: new Date().toUTCString(),
    });

    if (updated) {
      sails.sockets.broadcast(
        `board:${updated.boardId}`,
        'mailUpdate',
        {
          item: updated,
        },
        inputs.request,
      );
    }

    return updated;
  },
};
