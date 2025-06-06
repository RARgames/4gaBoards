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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser } = inputs;

    await ProjectManager.destroy({
      userId: inputs.record.id,
    });

    await BoardMembership.destroy({
      userId: inputs.record.id,
    });

    await CardSubscription.destroy({
      userId: inputs.record.id,
    });

    await CardMembership.destroy({
      userId: inputs.record.id,
    });

    const user = await User.updateOne({
      id: inputs.record.id,
      deletedAt: null,
    }).set({
      deletedAt: new Date().toUTCString(),
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
    }

    return user;
  },
};
