const zxcvbn = require('zxcvbn');

const Errors = {
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
  },
  USERNAME_ALREADY_IN_USE: {
    usernameAlreadyInUse: 'Username already in use',
  },
  WEAK_PASSWORD: {
    weakPassword: 'Weak password',
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
    username: {
      type: 'string',
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 16,
      regex: /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/,
      allowNull: true,
    },
    phone: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    organization: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    ssoGoogleId: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    ssoGoogleEmail: {
      type: 'string',
      isEmail: true,
      allowNull: true,
    },
    ssoGithubId: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    ssoGithubUsername: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    ssoGithubEmail: {
      type: 'string',
      isEmail: true,
      allowNull: true,
    },
    ssoMicrosoftId: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    ssoMicrosoftEmail: {
      type: 'string',
      isEmail: true,
      allowNull: true,
    },
    ssoOidcId: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    ssoOidcEmail: {
      type: 'string',
      isEmail: true,
      allowNull: true,
    },
  },

  exits: {
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
    weakPassword: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, [
      'email',
      'password',
      'name',
      'username',
      'phone',
      'organization',
      'ssoGoogleId',
      'ssoGoogleEmail',
      'ssoGithubId',
      'ssoGithubUsername',
      'ssoGithubEmail',
      'ssoMicrosoftId',
      'ssoMicrosoftEmail',
      'ssoOidcId',
      'ssoOidcEmail',
    ]);

    if (zxcvbn(values.password).score < sails.config.custom.requiredPasswordStrength) {
      throw Errors.WEAK_PASSWORD;
    }

    const user = await sails.helpers.users.createOne
      .with({
        values,
        currentUser,
        request: this.req,
      })
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE)
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE);

    return {
      item: user,
    };
  },
};
