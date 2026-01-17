const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.project)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
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

  exits: {
    userAlreadyProjectManager: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    const projectManager = await ProjectManager.create({
      projectId: values.project.id,
      userId: values.user.id,
      createdById: currentUser.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyProjectManager')
      .fetch();

    if (projectManager) {
      const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(projectManager.projectId);

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectManagerCreate',
          {
            item: projectManager,
          },
          inputs.request,
        );
      });

      const userPrefs = await sails.helpers.userPrefs.getOne.with({ criteria: { id: values.user.id }, currentUser });
      await sails.helpers.projectMemberships.createOne
        .with({
          values: {
            projectId: values.project.id,
            userId: values.user.id,
            isSubscribed: userPrefs?.subscribeToNewProjects || false,
          },
          currentUser,
          request: this.req,
        })
        .tolerate('E_UNIQUE');

      await sails.helpers.actions.createOne.with({
        values: {
          project: values.project,
          scope: Action.Scopes.PROJECT,
          type: Action.Types.PROJECT_MANAGER_ADD,
          data: {
            projectManagerId: projectManager.id,
            userId: projectManager.userId,
            projectId: projectManager.projectId,
            userName: values.user.name,
          },
        },
        currentUser,
        request: inputs.request,
      });

      await sails.helpers.projects.updateMeta.with({ id: projectManager.projectId, currentUser, skipMetaUpdate });
    }

    return projectManager;
  },
};
