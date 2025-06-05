const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
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
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    const attachment = await Attachment.create({
      ...values,
      cardId: values.card.id,
      createdById: currentUser.id,
    }).fetch();

    if (attachment) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'attachmentCreate',
        {
          item: attachment,
          requestId: inputs.requestId,
        },
        inputs.request,
      );

      await sails.helpers.cards.updateMeta.with({ id: attachment.cardId, currentUser });
    }

    return attachment;
  },
};
