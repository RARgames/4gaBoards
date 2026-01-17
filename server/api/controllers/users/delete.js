const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    userNotFound: {
      responseType: 'notFound',
    },
    insufficientPermissions: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    let user = await sails.helpers.users.getOne(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (currentUser.id === user.id) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    if (sails.config.custom.demoMode) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    user = await sails.helpers.users.deleteOne.with({
      record: user,
      currentUser,
      request: this.req,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    // Delete all projectMemberships associated with user
    const projectMemberships = await sails.helpers.projectMemberships.getMany({ userId: user.id });
    projectMemberships.forEach(async (projectMembership) => {
      await sails.helpers.projectMemberships.deleteOne.with({
        record: projectMembership,
        currentUser,
        request: this.req,
      });
    });

    return {
      item: user,
    };
  },
};
