const Errors = {
  NOT_ENOUGH_RIGHTS: { notEnoughRights: 'Not enough rights' },
};

module.exports = {
  inputs: {
    query: {
      type: 'string',
      isNotEmptyString: true,
      required: true,
    },
  },

  exits: {
    notEnoughRights: { responseType: 'forbidden' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);
      if (managerProjectIds.length === 0) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const query = inputs.query.trim().toLowerCase();

    if (!query.includes('@')) {
      return {
        item: null,
      };
    }

    const users = await User.find({
      deletedAt: null,
    }).select(['id', 'email']);

    const user = users.find((u) => u.email.toLowerCase() === query);

    if (!user) {
      return {
        item: null,
      };
    }

    return {
      item: {
        id: user.id,
        email: user.email,
      },
    };
  },
};
