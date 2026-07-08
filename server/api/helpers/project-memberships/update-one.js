module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
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

    const projectMembership = await ProjectMembership.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (projectMembership) {
      sails.sockets.broadcast(
        `user:${projectMembership.userId}`,
        'projectMembershipUpdate',
        {
          item: projectMembership,
        },
        inputs.request,
      );

      sails.sockets.broadcast(
        `project:${projectMembership.projectId}`,
        'projectMembershipUpdate',
        {
          item: projectMembership,
        },
        inputs.request,
      );
    }

    return projectMembership;
  },
};
