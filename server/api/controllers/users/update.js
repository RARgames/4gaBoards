const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
  },
};

const avatarUrlValidator = (value) => _.isNull(value);

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    isAdmin: {
      type: 'boolean',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    avatarUrl: {
      type: 'json',
      custom: avatarUrlValidator,
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
    lastLogin: {
      type: 'ref',
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

    if (!currentUser.isAdmin) {
      if (inputs.id !== currentUser.id) {
        throw Errors.USER_NOT_FOUND; // Forbidden
      }

      delete inputs.isAdmin; // eslint-disable-line no-param-reassign
    }

    let user = await sails.helpers.users.getOne(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (currentUser.id === user.id && currentUser.isAdmin && inputs.isAdmin === false) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    const values = {
      ..._.pick(inputs, [
        'isAdmin',
        'name',
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
        'lastLogin',
      ]),
      avatar: inputs.avatarUrl,
    };

    if (sails.config.custom.demoMode) {
      delete values.isAdmin;
      if (user.id !== currentUser.id) {
        delete values.name;
        delete values.phone;
        delete values.organization;
      }
    }

    user = await sails.helpers.users.updateOne.with({
      values,
      record: user,
      currentUser,
      request: this.req,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: user,
    };
  },
};
