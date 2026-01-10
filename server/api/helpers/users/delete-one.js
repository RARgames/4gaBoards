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

    await ProjectManager.destroy({
      userId: inputs.record.id,
    });

    const boardMemberships = await BoardMembership.destroy({
      userId: inputs.record.id,
    }).fetch();

    await Promise.all(boardMemberships.map((boardMembership) => sails.helpers.boards.updateMeta.with({ id: boardMembership.boardId, currentUser, skipMetaUpdate })));

    await CardSubscription.destroy({
      userId: inputs.record.id,
    });

    const user = await User.updateOne({
      id: inputs.record.id,
      deletedAt: null,
    }).set({
      deletedAt: new Date().toUTCString(),
      deletedById: currentUser.id,
    });

    if (user) {
      /* const projectIds = await sails.helpers.users.getManagerProjectIds(user.id);

      const userIds = _.union(
        [user.id],
        await sails.helpers.users.getAdminIds(),
        await sails.helpers.projects.getManagerAndBoardMemberUserIds(projectIds),
      ); */

      await sails.helpers.userPrefs.deleteOne.with({ record: user, currentUser });

      const users = await sails.helpers.users.getMany();
      const userIds = [inputs.record.id, ...sails.helpers.utils.mapRecords(users)];

      userIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'userDelete',
          {
            item: user,
          },
          inputs.request,
        );
      });

      await sails.helpers.actions.createOne.with({
        values: {
          userAccount: user,
          scope: Action.Scopes.USER,
          type: Action.Types.USER_DELETE,
          data: {
            userId: user.id,
            userName: user.name,
          },
        },
        currentUser,
        request: inputs.request,
      });
    }

    return user;
  },
};
