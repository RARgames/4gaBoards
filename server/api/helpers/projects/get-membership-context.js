module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = inputs;

    const isAdmin = !!currentUser.isAdmin;
    const isManager = await sails.helpers.users.isProjectManager(currentUser.id, inputs.projectId);
    const membership = await sails.helpers.projectMemberships.getOne({ projectId: inputs.projectId, userId: currentUser.id });

    return {
      isAdmin,
      isManager,
      isMember: !!membership,
      membership,
    };
  },
};
