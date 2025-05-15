const zxcvbn = require('zxcvbn');

const Errors = {
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
  },
  WEAK_PASSWORD: {
    weakPassword: 'Weak password',
  },
  POLICY_NOT_ACCEPTED: {
    policyNotAccepted: 'Policy not accepted',
  },
  CORE_NOT_FOUND: {
    coreNotFound: 'coreNotFound',
  },
  REGISTRATION_DISABLED: {
    registrationDisabled: 'registrationDisabled',
  },
  LOCAL_REGISTRATION_DISABLED: {
    localRegistrationDisabled: 'localRegistrationDisabled',
  },
};

module.exports = {
  inputs: {
    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    policy: {
      type: 'boolean',
      required: true,
    },
  },

  exits: {
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
    weakPassword: {
      responseType: 'conflict',
    },
    policyNotAccepted: {
      responseType: 'conflict',
    },
    coreNotFound: {
      responseType: 'notFound',
    },
    registrationDisabled: {
      responseType: 'forbidden',
    },
    localRegistrationDisabled: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const values = _.pick(inputs, ['email', 'password', 'name', 'policy']);

    if (zxcvbn(values.password).score < sails.config.custom.requiredPasswordStrength) {
      throw Errors.WEAK_PASSWORD;
    }
    if (!values.policy) {
      throw Errors.POLICY_NOT_ACCEPTED;
    }

    const core = await Core.findOne({ id: 0 });
    if (!core) {
      throw Errors.CORE_NOT_FOUND;
    }
    if (!core.registrationEnabled) {
      throw Errors.REGISTRATION_DISABLED;
    }
    if (!core.localRegistrationEnabled) {
      throw Errors.LOCAL_REGISTRATION_DISABLED;
    }

    const user = await sails.helpers.users.createOne.with({ values, request: this.req }).intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE);

    const accessToken = sails.helpers.utils.createToken(user.id);
    await Session.create({ accessToken, remoteAddress: this.req.connection.remoteAddress, userId: user.id, userAgent: this.req.headers['user-agent'] });
    return {
      item: accessToken,
    };
  },
};
