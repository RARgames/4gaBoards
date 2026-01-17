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

    let projectManager;
    if (project) {
      projectManager = await ProjectManager.create({
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

      const userPrefs = await sails.helpers.userPrefs.getOne.with({ criteria: { id: currentUser.id }, currentUser });
      await sails.helpers.projectMemberships.createOne.with({
        values: {
          projectId: project.id,
          userId: currentUser.id,
          isSubscribed: userPrefs?.subscribeToNewProjects || false,
        },
        currentUser,
        request: inputs.request,
      });
      project.isSubscribed = await sails.helpers.users.isProjectSubscriber(currentUser.id, project.id);

      await sails.helpers.actions.createOne.with({
        values: {
          project,
          scope: Action.Scopes.PROJECT,
          type: Action.Types.PROJECT_CREATE,
          data: {
            projectId: project.id,
            projectName: project.name,
          },
        },
        currentUser,
        request: inputs.request,
      });
    }

    return {
      project,
      projectManager,
    };
  },
};
