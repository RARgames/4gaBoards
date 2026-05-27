/**
 * Core.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    registrationEnabled: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'registration_enabled',
    },
    localRegistrationEnabled: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'local_registration_enabled',
    },
    ssoRegistrationEnabled: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'sso_registration_enabled',
    },
    projectCreationAllEnabled: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'project_creation_all_enabled',
    },
    syncSsoDataOnAuth: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'sync_sso_data_on_auth',
    },
    syncSsoAdminOnAuth: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'sync_sso_admin_on_auth',
    },
    allowedRegisterDomains: {
      type: 'json',
      defaultsTo: [],
      columnName: 'allowed_register_domains',
    },
    instanceId: {
      type: 'string',
      allowNull: true,
      columnName: 'instance_id',
    },
    systemNotificationsPublicKey: {
      type: 'string',
      allowNull: true,
      columnName: 'system_notifications_public_key',
    },
    systemNotificationResponsesPublicKey: {
      type: 'string',
      allowNull: true,
      columnName: 'system_notification_responses_public_key',
    },
    systemNotificationResponsesPrivateKey: {
      type: 'string',
      allowNull: true,
      columnName: 'system_notification_responses_private_key',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    createdById: {
      model: 'User',
      required: true,
      columnName: 'created_by_id',
    },
    updatedById: {
      model: 'User',
      columnName: 'updated_by_id',
    },
  },

  tableName: 'core',

  customToJSON() {
    return _.omit(this, ['instanceId', 'systemNotificationsPublicKey', 'systemNotificationResponsesPublicKey', 'systemNotificationResponsesPrivateKey']);
  },
};
