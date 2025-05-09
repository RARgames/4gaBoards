/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

const path = require('path');
const sails = require('sails');

module.exports.custom = {
  /**
   *
   * Any other custom config this Sails app should use during development.
   *
   */

  baseUrl: process.env.BASE_URL,
  clientUrl: process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? process.env.BASE_URL : 'http://localhost:3000'),

  tokenExpiresIn: parseInt(process.env.TOKEN_EXPIRES_IN, 10) || 365,

  userAvatarsPath: path.join(sails.config.paths.public, 'user-avatars'),
  fullUserAvatarsPath: path.join(sails.config.appPath, 'public', 'user-avatars'),
  userAvatarsUrl: `${process.env.BASE_URL}/user-avatars`,

  projectBackgroundImagesPath: path.join(sails.config.paths.public, 'project-background-images'),
  fullProjectBackgroundImagesPath: path.join(sails.config.appPath, 'public', 'project-background-images'),
  projectBackgroundImagesUrl: `${process.env.BASE_URL}/project-background-images`,

  attachmentsPath: path.join(sails.config.appPath, 'private', 'attachments'),
  attachmentsUrl: `${process.env.BASE_URL}/attachments`,

  exportsPath: path.join(sails.config.appPath, 'private', 'exports'),
  exportsUrl: `${process.env.BASE_URL}/exports`,

  gettingStartedProjectsPath: path.join(sails.config.appPath, 'public', 'getting-started-project'),

  googleSsoUrl: `${process.env.BASE_URL}/auth/google`,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  githubSsoUrl: `${process.env.BASE_URL}/auth/github`,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  microsoftSsoUrl: `${process.env.BASE_URL}/auth/microsoft`,
  microsoftClientId: process.env.MICROSOFT_CLIENT_ID,

  demoMode: process.env.DEMO_MODE === 'true',

  positionGap: 65535,
  requiredPasswordStrength: 2,
  cacheMaxAge: 900,
};
