const crypto = require('crypto');

const valuesValidator = (value) => {
  return _.isPlainObject(value) && typeof value.userId === 'string' && typeof value.projectId === 'string' && typeof value.boardId === 'string' && (typeof value.listId === 'string' || value.listId == null);
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
    let token;
    let mailToken;

    do {
      token = crypto.randomBytes(8).toString('hex');
      /* eslint-disable-next-line no-await-in-loop */
      mailToken = await MailToken.findOne({ token });
    } while (mailToken);

    const newMailToken = await MailToken.create({
      ...inputs.values,
      token,
    }).fetch();

    if (newMailToken) {
      sails.sockets.broadcast(
        `board:${newMailToken.boardId}`,
        'mailTokenCreate',
        {
          item: newMailToken,
        },
        inputs.request,
      );
    }

    return newMailToken;
  },
};
