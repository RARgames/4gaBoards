module.exports = {
  inputs: {
    query: {
      type: 'string',
      isNotEmptyString: true,
      required: true,
    },
  },

  async fn(inputs) {
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
