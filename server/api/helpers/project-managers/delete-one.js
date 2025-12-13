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

      const project = await Project.findOne(projectManager.projectId);
      const user = await User.findOne(projectManager.userId);
      if (project && user) {
        await sails.helpers.actions.createOne.with({
          values: {
            project,
            scope: Action.Scopes.PROJECT,
            type: Action.Types.PROJECT_MANAGER_REMOVE,
            data: {
              projectMembershipId: projectManager.id,
              userId: projectManager.userId,
              projectId: projectManager.projectId,
              userName: user.name,
            },
          },
          currentUser,
        });
      }

      await sails.helpers.projects.updateMeta.with({ id: projectManager.projectId, currentUser, skipMetaUpdate });
    }

    return projectManager;
  },
};
