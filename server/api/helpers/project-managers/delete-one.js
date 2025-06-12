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

    const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(inputs.record.projectId);

    const projectManager = await ProjectManager.destroyOne(inputs.record.id);

    if (projectManager) {
      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectManagerDelete',
          {
            item: projectManager,
          },
          inputs.request,
        );
      });

      await sails.helpers.projects.updateMeta.with({ id: projectManager.projectId, currentUser, skipMetaUpdate });
    }

    return projectManager;
  },
};
