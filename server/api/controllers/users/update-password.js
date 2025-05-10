const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn');

const { getRemoteAddress } = require('../../../utils/remoteAddress');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  INVALID_CURRENT_PASSWORD: {
    invalidCurrentPassword: 'Invalid current password',
  },
  WEAK_PASSWORD: {
    weakPassword: 'Weak password',
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
    password: {
      type: 'string',
      required: true,
    },
    currentPassword: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    userNotFound: {
      responseType: 'notFound',
    },
    invalidCurrentPassword: {
      responseType: 'forbidden',
    },
    weakPassword: {
      responseType: 'conflict',
    },
    insufficientPermissions: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (zxcvbn(inputs.password).score < sails.config.custom.requiredPasswordStrength) {
      throw Errors.WEAK_PASSWORD;
    }

    if (inputs.id === currentUser.id) {
      if (!!currentUser.password && !inputs.currentPassword) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
    } else if (!currentUser.isAdmin) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    let user = await sails.helpers.users.getOne(inputs.id);
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (sails.config.custom.demoMode) {
      if (user.id !== currentUser.id) {
        throw Errors.INSUFFICIENT_PERMISSIONS;
      }
    }

    if (inputs.id === currentUser.id && !!currentUser.password && !bcrypt.compareSync(inputs.currentPassword, user.password)) {
      throw Errors.INVALID_CURRENT_PASSWORD;
    }

    const values = _.pick(inputs, ['password']);

    user = await sails.helpers.users.updateOne.with({
      values,
      record: user,
      user: currentUser,
      request: this.req,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (user.id === currentUser.id) {
      const accessToken = sails.helpers.utils.createToken(user.id, user.passwordUpdatedAt);

      await Session.create({
        accessToken,
        userId: user.id,
        remoteAddress: getRemoteAddress(this.req),
        userAgent: this.req.headers['user-agent'],
      });

      return {
        item: user,
        included: {
          accessTokens: [accessToken],
        },
      };
    }

    return {
      item: user,
    };
  },
};
