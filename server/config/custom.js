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

  uploadRateLimit: {
    enabled: process.env.UPLOAD_RATE_LIMIT_ENABLED !== 'false',
    maxAttempts: Math.max(parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_ATTEMPTS, 10) || 30, 1),
    windowMs: Math.max(parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000, 1000),
    store: process.env.UPLOAD_RATE_LIMIT_STORE || 'memory',
    redisUrl: process.env.UPLOAD_RATE_LIMIT_REDIS_URL || null,
    redisConnectTimeoutMs: Math.max(parseInt(process.env.UPLOAD_RATE_LIMIT_REDIS_CONNECT_TIMEOUT_MS, 10) || 500, 100),
    keyPrefix: process.env.UPLOAD_RATE_LIMIT_KEY_PREFIX || 'rl:upload',
  },

  uploadLimits: {
    attachmentMaxBytes: Math.max(parseInt(process.env.ATTACHMENT_MAX_BYTES, 10) || 25 * 1024 * 1024, 1),
    avatarMaxBytes: Math.max(parseInt(process.env.AVATAR_MAX_BYTES, 10) || 25 * 1024 * 1024, 1),
    projectBackgroundImageMaxBytes: Math.max(parseInt(process.env.PROJECT_BACKGROUND_IMAGE_MAX_BYTES, 10) || 25 * 1024 * 1024, 1),
    boardImportMaxBytes: Math.max(parseInt(process.env.BOARD_IMPORT_MAX_BYTES, 10) || 100 * 1024 * 1024, 1),
  },

  boardImportExtractionLimits: {
    maxCompressedBytes: Math.max(parseInt(process.env.BOARD_IMPORT_MAX_COMPRESSED_BYTES, 10) || 100 * 1024 * 1024, 1),
    maxUncompressedBytes: Math.max(parseInt(process.env.BOARD_IMPORT_MAX_UNCOMPRESSED_BYTES, 10) || 500 * 1024 * 1024, 1),
    maxEntries: Math.max(parseInt(process.env.BOARD_IMPORT_MAX_ENTRIES, 10) || 5000, 1),
    maxExtractionMs: Math.max(parseInt(process.env.BOARD_IMPORT_MAX_EXTRACTION_MS, 10) || 30 * 1000, 1000),
  },

  sharpLimits: {
    maxInputPixels: Math.max(parseInt(process.env.SHARP_MAX_INPUT_PIXELS, 10) || 40_000_000, 1),
    concurrency: Math.max(parseInt(process.env.SHARP_CONCURRENCY, 10) || 2, 1),
    cacheMemoryMb: Math.max(parseInt(process.env.SHARP_CACHE_MEMORY_MB, 10) || 50, 0),
    cacheItems: Math.max(parseInt(process.env.SHARP_CACHE_ITEMS, 10) || 100, 0),
    cacheFiles: Math.max(parseInt(process.env.SHARP_CACHE_FILES, 10) || 20, 0),
  },

  positionGap: 65535,
  requiredPasswordStrength: 2,
  cacheMaxAge: 900,
  actionsLimit: 50,
  commentsLimit: 50,
  notificationsCronSchedule: process.env.NODE_ENV === 'production' ? '*/5 * * * *' : '*/1 * * * *',
  notificationsMailBatchIntervalMs: process.env.NODE_ENV === 'production' ? 10 * 60 * 1000 : 1 * 60 * 1000,
  emailVerificationCooldownMs: 60 * 1000,
  systemNotificationsHostUrl: process.env.NODE_ENV === 'production' ? 'https://notifications.4gaboards.com' : process.env.NOTIFICATIONS_HOST_URL || 'https://notifications.4gaboards.com',
  systemNotificationsDisabled: process.env.SYSTEM_NOTIFICATIONS_DISABLED === 'true',

  androidPackageName: process.env.ANDROID_PACKAGE_NAME || 'com.ga4boards.app',
  androidSha256Fingerprint: process.env.ANDROID_SHA256_FINGERPRINT || '0A:8F:18:85:B8:62:D5:B2:93:6A:A4:AD:CE:E8:85:3B:6A:DD:2F:CA:B7:1E:DC:99:4D:9E:A7:6A:56:83:F7:40',
};
