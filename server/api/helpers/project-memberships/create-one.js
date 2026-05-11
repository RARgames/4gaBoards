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
    const { values } = inputs;

    const projectMembership = await ProjectMembership.create({ ...values }).fetch();

    return {
      projectMembership,
    };
  },
};
