/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /**
   *
   * Default policy for all controllers and actions, unless overridden.
   * (`true` allows public access)
   *
   */

  '*': 'is-authenticated',

  'users/create': ['is-authenticated', 'is-admin'],
  'users/delete': ['is-authenticated', 'is-admin'],

  'access-tokens/create': 'rate-limit-auth',
  'attachments/create': ['is-authenticated', 'rate-limit-upload'],
  'boards/create': ['is-authenticated', 'rate-limit-upload'],
  'projects/update-background-image': ['is-authenticated', 'rate-limit-upload'],
  'users/update-avatar': ['is-authenticated', 'rate-limit-upload'],

  'core/show': true,
  'assetlinks/show': true,
  'auth/*': true,
  'register/create': true,
  'notifications/receive-system-notification': true,
};
