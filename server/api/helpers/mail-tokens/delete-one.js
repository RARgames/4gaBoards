module.exports = {
  inputs: {
    record: {
      type: 'ref',
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
    const { currentUser, skipMetaUpdate } = inputs;

    const { project } = await sails.helpers.mailTokens.getProjectPath(inputs.record.id);
    const mailToken = await MailToken.destroyOne({ id: inputs.record.id });

    if (mailToken) {
      const projectManagersIds = await sails.helpers.projects.getManagerUserIds(project.id);
      const projectRelatedUserIds = _.uniq([...projectManagersIds, mailToken.userId]);

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'mailTokenDelete',
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
          scope: mailToken.listId ? Action.Scopes.LIST : Action.Scopes.BOARD,
          type: Action.Types.MAIL_TOKEN_DELETE,
          list,
          board,
          data: {
            mailTokenId: mailToken.id,
            mailTokenToken: mailToken.token,
            userId: mailToken.userId,
            userName: user?.name,
            boardName: board ? board.name : undefined,
            listName: list ? list.name : undefined,
          },
        },
        currentUser,
        request: inputs.request,
      });

      if (mailToken.listId) {
        await sails.helpers.lists.updateMeta.with({ id: mailToken.listId, currentUser, skipMetaUpdate });
      } else if (mailToken.boardId) {
        await sails.helpers.boards.updateMeta.with({ id: mailToken.boardId, currentUser, skipMetaUpdate });
      }
    }

    return mailToken;
  },
};
