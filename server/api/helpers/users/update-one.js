const path = require('path');
const bcrypt = require('bcrypt');
const rimraf = require('rimraf');
const { v4: uuid } = require('uuid');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.email) && !_.isString(value.email)) {
    return false;
  }

  if (!_.isUndefined(value.password) && !_.isString(value.password)) {
    return false;
  }

  if (!_.isNil(value.username) && !_.isString(value.username)) {
    return false;
  }

  if (!_.isNil(value.avatar) && !_.isPlainObject(value.avatar)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    if (!_.isUndefined(values.email)) {
      values.email = values.email.toLowerCase();
    }

    let isOnlyPasswordChange = false;

    if (!_.isUndefined(values.password)) {
      Object.assign(values, {
        password: bcrypt.hashSync(values.password, 10),
        passwordChangedAt: new Date().toUTCString(),
      });

      if (Object.keys(values).length === 1) {
        isOnlyPasswordChange = true;
      }
    }

    if (values.username) {
      values.username = values.username.toLowerCase();
    }

    const user = await User.updateOne({
      id: inputs.record.id,
      deletedAt: null,
    })
      .set({ updatedById: currentUser.id, ...values })
      .intercept(
        {
          message: 'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_email_unique"',
        },
        'emailAlreadyInUse',
      )
      .intercept(
        {
          message: 'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_username_unique"',
        },
        'usernameAlreadyInUse',
      );

    if (user) {
      if (inputs.record.avatar && (!user.avatar || user.avatar.dirname !== inputs.record.avatar.dirname)) {
        try {
          rimraf.sync(path.join(sails.config.custom.userAvatarsPath, inputs.record.avatar.dirname));
        } catch (error) {
          sails.log.warn(error.stack);
        }
      }

      if (!_.isUndefined(values.password)) {
        sails.sockets.broadcast(
          `user:${user.id}`,
          'userDelete', // TODO: introduce separate event
          {
            item: user,
          },
          inputs.request,
        );

        if (user.id === currentUser.id && inputs.request && inputs.request.isSocket) {
          const tempRoom = uuid();

          sails.sockets.addRoomMembersToRooms(`@user:${user.id}`, tempRoom, () => {
            sails.sockets.leave(inputs.request, tempRoom, () => {
              sails.sockets.leaveAll(tempRoom);
            });
          });
        } else {
          sails.sockets.leaveAll(`@user:${user.id}`);
        }
      }

      if (!isOnlyPasswordChange) {
        /* const projectIds = await sails.helpers.users.getManagerProjectIds(user.id);

        const userIds = _.union(
          [user.id],
          await sails.helpers.users.getAdminIds(),
          await sails.helpers.projects.getManagerAndBoardMemberUserIds(projectIds),
        ); */

        const users = await sails.helpers.users.getMany();
        const userIds = sails.helpers.utils.mapRecords(users);

        userIds.forEach((userId) => {
          sails.sockets.broadcast(
            `user:${userId}`,
            'userUpdate',
            {
              item: user,
            },
            inputs.request,
          );
        });
      }

      const valueKeys = Object.keys(values);
      const isOnlyLastLogin = valueKeys.length === 1 && Object.prototype.hasOwnProperty.call(values, 'lastLogin');

      if (!isOnlyLastLogin) {
        await sails.helpers.actions.createOne.with({
          values: {
            userAccount: user,
            scope: Action.Scopes.USER,
            type: Action.Types.USER_UPDATE,
            data: {
              userId: user.id,
              prevUserName: values.name !== undefined ? inputs.record.name : undefined,
              userName: user.name,
              prevUserEmail: values.email !== undefined ? inputs.record.email : undefined,
              userEmail: values.email !== undefined ? user.email : undefined,
              prevUserUsername: values.username !== undefined ? inputs.record.username : undefined,
              userUsername: values.username !== undefined ? user.username : undefined,
              prevUserIsAdmin: values.isAdmin !== undefined ? inputs.record.isAdmin : undefined,
              userIsAdmin: values.isAdmin !== undefined ? user.isAdmin : undefined,
              prevUserPhone: values.phone !== undefined ? inputs.record.phone : undefined,
              userPhone: values.phone !== undefined ? user.phone : undefined,
              prevUserOrganization: values.organization !== undefined ? inputs.record.organization : undefined,
              userOrganization: values.organization !== undefined ? user.organization : undefined,
              prevUserAvatar: values.avatar !== undefined ? inputs.record.avatar : undefined,
              userAvatar: values.avatar !== undefined ? user.avatar : undefined,
              prevSsoGoogleEmail: values.ssoGoogleEmail !== undefined ? inputs.record.ssoGoogleEmail : undefined,
              ssoGoogleEmail: values.ssoGoogleEmail !== undefined ? user.ssoGoogleEmail : undefined,
              prevSsoGithubEmail: values.ssoGithubEmail !== undefined ? inputs.record.ssoGithubEmail : undefined,
              ssoGithubEmail: values.ssoGithubEmail !== undefined ? user.ssoGithubEmail : undefined,
              prevSsoGithubUsername: values.ssoGithubUsername !== undefined ? inputs.record.ssoGithubUsername : undefined,
              ssoGithubUsername: values.ssoGithubUsername !== undefined ? user.ssoGithubUsername : undefined,
              prevSsoMicrosoftEmail: values.ssoMicrosoftEmail !== undefined ? inputs.record.ssoMicrosoftEmail : undefined,
              ssoMicrosoftEmail: values.ssoMicrosoftEmail !== undefined ? user.ssoMicrosoftEmail : undefined,
              prevSsoOidcEmail: values.ssoOidcEmail !== undefined ? inputs.record.ssoOidcEmail : undefined,
              ssoOidcEmail: values.ssoOidcEmail !== undefined ? user.ssoOidcEmail : undefined,
              passwordChanged: !_.isUndefined(values.password),
            },
          },
          currentUser,
        });
      }
    }

    return user;
  },
};
