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

    if (!_.isUndefined(values.position)) {
      const projectMemberships = await sails.helpers.users.getProjectMemberships(inputs.record.userId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, projectMemberships);

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await ProjectMembership.update({
          id,
          projectId: inputs.record.projectId,
        }).set({ position: nextPosition });

        sails.sockets.broadcast(`user:${inputs.record.userId}`, 'projectMembershipUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

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
