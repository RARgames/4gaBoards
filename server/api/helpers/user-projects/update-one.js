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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const userProject = await UserProject.updateOne(inputs.record.id).set({ ...values });

    sails.sockets.broadcast(
      `user:${inputs.record.userId}`,
      'userProjectUpdate',
      {
        item: userProject,
      },
      inputs.request,
    );

    return userProject;
  },
};
