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
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
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
    const { values, currentUser, skipMetaUpdate, skipActions } = inputs;

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

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            card: values.card,
            scope: Action.Scopes.ATTACHMENT,
            type: Action.Types.CARD_ATTACHMENT_CREATE,
            data: {
              attachmentId: attachment.id,
              attachmentName: attachment.name,
            },
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: attachment.cardId, currentUser, skipMetaUpdate });
    }

    return attachment;
  },
};
