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
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyProjectMember: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    const projectMembership = await ProjectMembership.create({
      ..._.omit(values, ['project', 'user']),
      projectId: values.project.id,
      userId: values.user.id,
      createdById: currentUser.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyProjectMember')
      .fetch();

    if (projectMembership) {
      sails.sockets.broadcast(
        `user:${projectMembership.userId}`,
        'projectMembershipCreate',
        {
          item: projectMembership,
        },
        inputs.request,
      );

      sails.sockets.broadcast(
        `project:${projectMembership.projectId}`,
        'projectMembershipCreate',
        {
          item: projectMembership,
        },
        inputs.request,
      );
    }

    return projectMembership;
  },
};
