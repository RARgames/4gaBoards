module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    ssoRegistrationDisabled: {},
    registrationDisabled: {},
    coreNotFound: {},
  },

  async fn(inputs) {
    const email = inputs.email.toLowerCase();
    let user = await sails.helpers.users.getOne(inputs.id);
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }
    const values = { ssoGoogleEmail: email };
    user = await sails.helpers.users.updateOne
      .with({
        values,
        record: user,
        user: inputs.request,
        request: inputs.request,
      })
      .intercept('ssoEmailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE);

    if (user) {
      return user;
    }
    return null;
  },
};
