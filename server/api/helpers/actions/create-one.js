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
  if (value.scope === Action.Scopes.USER && !_.isPlainObject(value.userAccount)) {
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
          ...(!values.data?.cardName ? { cardName: values.card.name } : {}),
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
    } else if (values.scope === Action.Scopes.LIST) {
      const board = await Board.findOne(values.list.boardId);
      if (!board) {
        throw 'boardNotFound';
      }

      action = await Action.create({
        ...values,
        listId: values.list.id,
        boardId: board.id,
        projectId: board.projectId,
        userId: actionUser.id,
        createdById: currentUser.id,
        data: {
          ...values.data,
          ...(!values.data?.boardName ? { boardName: board.name } : {}),
        },
      }).fetch();

      if (action) {
        sails.sockets.broadcast(
          `board:${board.id}`,
          'actionCreate',
          {
            item: action,
          },
          inputs.request,
        );

        // TODO make subscriptions work for board actions
        // if (!inputs.skipNotifications) {
        //   const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);
        //   await Promise.all(
        //     subscriptionUserIds.map(async (userId) =>
        //       sails.helpers.notifications.createOne.with({
        //         values: {
        //           userId,
        //           action,
        //         },
        //         currentUser,
        //       }),
        //     ),
        //   );
        // }
      }
    } else if (values.scope === Action.Scopes.BOARD) {
      action = await Action.create({
        ...values,
        boardId: values.board.id,
        projectId: values.board.projectId,
        userId: actionUser.id,
        createdById: currentUser.id,
        data: {
          ...values.data,
          ...(!values.data?.boardName ? { boardName: values.board.name } : {}),
        },
      }).fetch();

      if (action) {
        sails.sockets.broadcast(
          `board:${values.board.id}`,
          'actionCreate',
          {
            item: action,
          },
          inputs.request,
        );

        // TODO make subscriptions work for board actions
        // if (!inputs.skipNotifications) {
        //   const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);
        //   await Promise.all(
        //     subscriptionUserIds.map(async (userId) =>
        //       sails.helpers.notifications.createOne.with({
        //         values: {
        //           userId,
        //           action,
        //         },
        //         currentUser,
        //       }),
        //     ),
        //   );
        // }
      }
    } else if (values.scope === Action.Scopes.PROJECT) {
      action = await Action.create({
        ...values,
        projectId: values.project.id,
        userId: actionUser.id,
        createdById: currentUser.id,
        data: {
          ...values.data,
          ...(!values.data?.projectName ? { projectName: values.project.name } : {}),
        },
      }).fetch();

      if (action) {
        sails.sockets.broadcast(
          `project:${values.project.id}`,
          'actionCreate',
          {
            item: action,
          },
          inputs.request,
        );
        // TODO make subscriptions work for board actions
        // if (!inputs.skipNotifications) {
        //   const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);
        //   await Promise.all(
        //     subscriptionUserIds.map(async (userId) =>
        //       sails.helpers.notifications.createOne.with({
        //         values: {
        //           userId,
        //           action,
        //         },
        //         currentUser,
        //       }),
        //     ),
        //   );
        // }
      }
    } else if (values.scope === Action.Scopes.USER) {
      action = await Action.create({
        ...values,
        userAccountId: values.userAccount.id,
        userId: actionUser.id,
        createdById: currentUser.id,
      }).fetch();

      if (action) {
        // TODO will not work
        // sails.sockets.broadcast(
        //   `board:${values.board.id}`,
        //   'actionCreate',
        //   {
        //     item: action,
        //   },
        //   inputs.request,
        // );
        // TODO make subscriptions work for board actions
        // if (!inputs.skipNotifications) {
        //   const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);
        //   await Promise.all(
        //     subscriptionUserIds.map(async (userId) =>
        //       sails.helpers.notifications.createOne.with({
        //         values: {
        //           userId,
        //           action,
        //         },
        //         currentUser,
        //       }),
        //     ),
        //   );
        // }
      }
    } else if (values.scope === Action.Scopes.INSTANCE) {
      action = await Action.create({
        ...values,
        userId: actionUser.id,
        createdById: currentUser.id,
        data: {
          ...values.data,
        },
      }).fetch();

      if (action) {
        sails.sockets.broadcast(
          `instance`,
          'actionCreate',
          {
            item: { ...action, coreId: 0 },
          },
          inputs.request,
        );
        // TODO make subscriptions work for board actions
        // if (!inputs.skipNotifications) {
        //   const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);
        //   await Promise.all(
        //     subscriptionUserIds.map(async (userId) =>
        //       sails.helpers.notifications.createOne.with({
        //         values: {
        //           userId,
        //           action,
        //         },
        //         currentUser,
        //       }),
        //     ),
        //   );
        // }
      }
    }

    return action;
  },
};
