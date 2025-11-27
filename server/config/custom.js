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

  ssoUrls: {
    google: `${process.env.BASE_URL}/auth/google`,
    github: `${process.env.BASE_URL}/auth/github`,
    microsoft: `${process.env.BASE_URL}/auth/microsoft`,
    oidc: `${process.env.BASE_URL}/auth/oidc`,
  },
  ssoClientIds: {
    google: process.env.GOOGLE_CLIENT_ID,
    github: process.env.GITHUB_CLIENT_ID,
    microsoft: process.env.MICROSOFT_CLIENT_ID,
    oidc: process.env.OIDC_CLIENT_ID,
  },
  ssoAvailable: {
    google: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    github: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
    microsoft: !!process.env.MICROSOFT_CLIENT_ID && !!process.env.MICROSOFT_CLIENT_SECRET,
    oidc: !!process.env.OIDC_CLIENT_ID && !!process.env.OIDC_CLIENT_SECRET && !!process.env.OIDC_AUTH_URL && !!process.env.OIDC_TOKEN_URL && !!process.env.OIDC_USERINFO_URL && !!process.env.OIDC_STATE_SECRET,
  },

  oidcEnabledMethods: (process.env.OIDC_ENABLED_METHODS || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => s && process.env[`OIDC_DISABLE_HINT_${s.toUpperCase()}`] !== 'true'),

  demoMode: process.env.DEMO_MODE === 'true',
  metricsEnabled: process.env.METRICS_ENABLED === 'true',

  positionGap: 65535,
  requiredPasswordStrength: 2,
  cacheMaxAge: 900,
  actionsLimit: 50,
};
