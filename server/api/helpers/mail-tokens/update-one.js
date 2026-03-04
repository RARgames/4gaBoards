const crypto = require('crypto');

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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    let token;
    let existingMailToken;

    do {
      token = crypto.randomBytes(8).toString('hex');
      /* eslint-disable-next-line no-await-in-loop */
      existingMailToken = await MailToken.findOne({ token });
    } while (existingMailToken);

    const mailToken = await MailToken.updateOne({ id: inputs.record.id }).set({
      ...values,
      token,
    });

    if (mailToken) {
      const { project } = await sails.helpers.mailTokens.getProjectPath(mailToken.id);
      const projectManagersIds = await sails.helpers.projects.getManagerUserIds(project.id);
      const projectRelatedUserIds = _.uniq([...projectManagersIds, mailToken.userId]);

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'mailTokenUpdate',
          {
            item: mailToken,
          },
          inputs.request,
        );
      });

      const user = await User.findOne(mailToken.userId);
      const board = mailToken.boardId ? await Board.findOne(mailToken.boardId) : undefined;
      const list = mailToken.listId ? await List.findOne(mailToken.listId) : undefined;
      await sails.helpers.actions.createOne.with({
        values: {
          board,
          list,
          scope: list ? Action.Scopes.LIST : Action.Scopes.BOARD,
          type: Action.Types.MAIL_TOKEN_UPDATE,
          data: {
            mailTokenId: mailToken.id,
            userId: mailToken.userId,
            userName: user?.name,
            boardName: board ? board.name : undefined,
            listName: list ? list.name : undefined,
          },
        },
        currentUser,
        request: inputs.request,
      });

      if (list) {
        await sails.helpers.lists.updateMeta.with({ id: list.id, currentUser, skipMetaUpdate });
      } else if (board) {
        await sails.helpers.boards.updateMeta.with({ id: board.id, currentUser, skipMetaUpdate });
      }
    }

    return mailToken;
  },
};
