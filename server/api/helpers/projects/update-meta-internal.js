const idValidator = (value) => _.isString(value);

module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: idValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { id, currentUser } = inputs;

    const project = await Project.updateOne(id).set({ updatedAt: new Date().toUTCString(), updatedById: currentUser.id });
    if (project) {
      const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(project.id);
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

    return project;
  },
};
