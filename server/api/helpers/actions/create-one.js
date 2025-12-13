const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!Object.values(Action.Scopes).includes(value.scope)) {
    return false;
  }
  if (value.scope === Action.Scopes.ATTACHMENT && !_.isPlainObject(value.attachment) && !_.isPlainObject(value.card)) {
    return false;
  }
  if (value.scope === Action.Scopes.TASK && !_.isPlainObject(value.task) && !_.isPlainObject(value.card)) {
    return false;
  }
  if (value.scope === Action.Scopes.COMMENT && !_.isPlainObject(value.comment) && !_.isPlainObject(value.card)) {
    return false;
  }
  if (value.scope === Action.Scopes.CARD && !_.isPlainObject(value.card)) {
    return false;
  }
  if (value.scope === Action.Scopes.LIST && !_.isPlainObject(value.list)) {
    return false;
  }
  if (value.scope === Action.Scopes.BOARD && !_.isPlainObject(value.board)) {
    return false;
  }
  if (value.scope === Action.Scopes.PROJECT && !_.isPlainObject(value.project)) {
    return false;
  }
  if (value.scope === Action.Scopes.USER && !_.isPlainObject(value.user)) {
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
    skipNotifications: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    boardNotFound: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;
    const actionUser = values.user || currentUser;

    let action;
    if ([Action.Scopes.CARD, Action.Scopes.TASK, Action.Scopes.COMMENT, Action.Scopes.ATTACHMENT].includes(values.scope)) {
      const board = await Board.findOne(values.card.boardId);
      if (!board) {
        throw 'boardNotFound';
      }

      action = await Action.create({
        ...values,
        attachmentId: values.attachment?.id,
        taskId: values.task?.id,
        commentId: values.comment?.id,
        cardId: values.card.id,
        listId: values.card.listId,
        boardId: values.card.boardId,
        projectId: board.projectId,
        userId: actionUser.id,
        createdById: currentUser.id,
        data: {
          ...values.data,
          ...(!values.data?.cardName && values.type !== Action.Types.CARD_COMMENT ? { cardName: values.card.name } : {}),
        },
      }).fetch();

      if (action) {
        sails.sockets.broadcast(
          `board:${values.card.boardId}`,
          'actionCreate',
          {
            item: action,
          },
          inputs.request,
        );

        if (!inputs.skipNotifications) {
          const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);
          await Promise.all(
            subscriptionUserIds.map(async (userId) =>
              sails.helpers.notifications.createOne.with({
                values: {
                  userId,
                  action,
                },
                currentUser,
              }),
            ),
          );
        }
      }
    }

    return action;
  },
};
