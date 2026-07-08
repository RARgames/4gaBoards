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
    const projectMembership = await ProjectMembership.destroyOne(inputs.record.id);

    if (projectMembership) {
      sails.sockets.broadcast(
        `user:${projectMembership.userId}`,
        'projectMembershipDelete',
        {
          item: projectMembership,
        },
        inputs.request,
      );

      sails.sockets.broadcast(
        `project:${projectMembership.projectId}`,
        'projectMembershipDelete',
        {
          item: projectMembership,
        },
        inputs.request,
      );
    }

    return projectMembership;
  },
};
