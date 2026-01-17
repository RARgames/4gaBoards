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
    const { values } = inputs;

    const projectMembership = await ProjectMembership.updateOne(inputs.record.id).set({ ...values });

    sails.sockets.broadcast(
      `user:${inputs.record.userId}`,
      'projectMembershipUpdate',
      {
        item: projectMembership,
      },
      inputs.request,
    );

    return projectMembership;
  },
};
