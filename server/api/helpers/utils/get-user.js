module.exports = {
  inputs: {
    accessToken: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const { accessToken } = inputs;

    let payload;
    try {
      payload = sails.helpers.utils.verifyToken(accessToken);
    } catch {
      return null;
    }

    const session = await Session.findOne({
      accessToken,
      deletedAt: null,
    });

    if (!session) {
      return null;
    }

    const user = await sails.helpers.users.getOne(payload.subject);

    if (user && user.passwordChangedAt > payload.issuedAt) {
      return null;
    }

    return user;
  },
};
