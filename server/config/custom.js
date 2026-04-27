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
  instanceName: process.env.INSTANCE_NAME || '4gaboards.com',

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

  mailServiceAvailable: false,
  mailServiceInboundEmail: process.env.MAIL_SERVICE_INBOUND_EMAIL,
  notificationsInternalApiClientLabel: 'internal:4gaBoardsNotifications',
  notificationsInternalApiClientPermissions: [
    'mail-tokens.get-list-id',
    'cards.create',
    'tasks.create',
    'task-memberships.create',
    'attachments.create',
    'card-labels.create',
    'card-memberships.create',
    'boards.find-label-by-name',
    'boards.find-user-by-username',
    'users.update-email-verification',
  ],
  demoMode: process.env.DEMO_MODE === 'true',

  metricsEnabled: process.env.METRICS_ENABLED === 'true',

  hyperdxEnabled: process.env.HYPERDX_ENABLED === 'true',
  hyperdxApiKey: process.env.HYPERDX_API_KEY || null,
  hyperdxInstanceName: process.env.HYPERDX_INSTANCE_NAME || process.env.INSTANCE_NAME || '4gaboards.com',
  hyperdxTracePropagationTargets: process.env.HYPERDX_TRACE_PROPAGATION_TARGETS || null,
  otelUrl: process.env.OTEL_URL || null,
  otelUrlFormat: process.env.OTEL_URL_FORMAT || 'http/protobuf',

  authRateLimit: {
    enabled: process.env.AUTH_RATE_LIMIT_ENABLED !== 'false',
    maxAttempts: Math.max(parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS, 10) || 5, 1),
    windowMs: Math.max(parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000, 60 * 1000),
  },

  positionGap: 65535,
  requiredPasswordStrength: 2,
  cacheMaxAge: 900,
  actionsLimit: 50,
  commentsLimit: 50,
  notificationsMailBatchIntervalMs: process.env.NODE_ENV === 'production' ? 10 * 60 * 1000 : 1 * 60 * 1000,
};
