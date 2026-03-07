const crypto = require('crypto');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  const hasBoard = _.isPlainObject(value.board);
  const hasList = _.isPlainObject(value.list);

  if (hasBoard === hasList) {
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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate, skipActions } = inputs;

    let token;
    let existingMailToken;

    do {
      token = crypto.randomBytes(8).toString('hex');
      /* eslint-disable-next-line no-await-in-loop */
      existingMailToken = await MailToken.findOne({ token });
    } while (existingMailToken);

    const mailToken = await MailToken.create({
      ...values,
      token,
      userId: currentUser.id,
      boardId: values.board?.id,
      listId: values.list?.id,
    }).fetch();

    if (mailToken) {
      const { project } = await sails.helpers.mailTokens.getProjectPath(mailToken.id);
      const projectManagersIds = await sails.helpers.projects.getManagerUserIds(project.id);
      const projectRelatedUserIds = _.uniq([...projectManagersIds, mailToken.userId]);

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'mailTokenCreate',
          {
            item: mailToken,
          },
          inputs.request,
        );
      });

      if (!skipActions) {
        const user = await User.findOne(mailToken.userId);
        await sails.helpers.actions.createOne.with({
          values: {
            board: values.board,
            list: values.list,
            scope: values.list ? Action.Scopes.LIST : Action.Scopes.BOARD,
            type: Action.Types.MAIL_TOKEN_CREATE,
            data: {
              mailTokenId: mailToken.id,
              userId: mailToken.userId,
              userName: user?.name,
              boardName: values.board?.name,
              listName: values.list?.name,
            },
          },
          currentUser,
          request: inputs.request,
        });
      }

      if (values.list) {
        await sails.helpers.lists.updateMeta.with({ id: values.list.id, currentUser, skipMetaUpdate });
      } else if (values.board) {
        await sails.helpers.boards.updateMeta.with({ id: values.board.id, currentUser, skipMetaUpdate });
      }
    }

    return mailToken;
  },
};
