module.exports = {
  inputs: {
    values: {
      type: 'json',
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
    const { values, currentUser } = inputs;

    const project = await Project.create({ createdById: currentUser.id, ...values }).fetch();

    const projectManager = await ProjectManager.create({
      projectId: project.id,
      userId: currentUser.id,
      createdById: currentUser.id,
    }).fetch();

    sails.sockets.broadcast(
      `user:${projectManager.userId}`,
      'projectCreate',
      {
        item: project,
      },
      inputs.request,
    );

    return {
      project,
      projectManager,
    };
  },
};
