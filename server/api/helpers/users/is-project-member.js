module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    projectId: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const projectMembership = await ProjectMembership.findOne({
      projectId: inputs.projectId,
      userId: inputs.id,
    });

    return !!projectMembership;
  },
};
