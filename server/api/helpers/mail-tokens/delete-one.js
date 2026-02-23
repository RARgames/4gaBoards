module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record } = inputs;
    const mailTokenCopy = { ...record };

    await MailToken.destroyOne({ id: record.id });

    if (mailTokenCopy) {
      sails.sockets.broadcast(
        `board:${mailTokenCopy.boardId}`,
        'mailTokenDelete',
        {
          item: mailTokenCopy,
        },
        inputs.request,
      );
    }

    return mailTokenCopy;
  },
};
