const zxcvbn = require('zxcvbn');

const Errors = {
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
  },
  USERNAME_ALREADY_IN_USE: {
    usernameAlreadyInUse: 'Username already in use',
  },
};

const passwordValidator = (value) => zxcvbn(value).score >= 2; // TODO: move to config

module.exports = {
  inputs: {
    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    password: {
      type: 'string',
      custom: passwordValidator,
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
    language: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    subscribeToOwnCards: {
      type: 'boolean',
    },
    descriptionMode: {
      type: 'string',
      isIn: User.DESCRIPTION_MODES,
      isNotEmptyString: true,
    },
    descriptionShown: {
      type: 'boolean',
    },
    tasksShown: {
      type: 'boolean',
    },
    attachmentsShown: {
      type: 'boolean',
    },
    commentsShown: {
      type: 'boolean',
    },
  },

  exits: {
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const values = _.pick(inputs, [
      'email',
      'password',
      'name',
      'username',
      'phone',
      'organization',
      'language',
      'subscribeToOwnCards',
      'descriptionMode',
      'descriptionShown',
      'tasksShown',
      'attachmentsShown',
      'commentsShown',
    ]);

    const user = await sails.helpers.users.createOne
      .with({
        values,
        request: this.req,
      })
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE)
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE);

    return {
      item: user,
    };
  },
};
