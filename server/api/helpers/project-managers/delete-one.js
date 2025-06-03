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

      let project = await Project.findOne(projectManager.projectId);
      if (project) {
        project = await Project.updateOne(project.id).set({ updatedById: currentUser.id });
        if (project) {
          projectRelatedUserIds.forEach((userId) => {
            sails.sockets.broadcast(`user:${userId}`, 'projectUpdate', {
              item: {
                id: project.id,
                updatedAt: project.updatedAt,
                updatedById: project.updatedById,
              },
            });
          });
        }
      }
    }

    return projectManager;
  },
};
