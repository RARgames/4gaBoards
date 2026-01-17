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
    const projectMembership = await ProjectMembership.destroy({
      id: inputs.record.id,
    });

    return projectMembership;
  },
};
