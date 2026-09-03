/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

const crypto = require('crypto');
const path = require('path');
const sails = require('sails');

// Any passphrase is accepted and folded down to the 32 bytes AES-256-GCM needs, so operators are
// not forced to generate key material by hand. Changing it makes every already-stored secret
// undecryptable, which surfaces as connections needing to be re-authorized rather than as data loss.
const secretEncryptionKey = process.env.SECRET_ENCRYPTION_KEY ? crypto.createHash('sha256').update(process.env.SECRET_ENCRYPTION_KEY).digest() : null;

// The calendar integration reuses the Google SSO OAuth client unless given its own, so an instance
// that already signs in with Google needs no second app registered - only the extra redirect URI.
const googleCalendarClientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const googleCalendarClientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

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

  documentsPath: path.join(sails.config.appPath, 'private', 'documents'),
  documentsUrl: `${process.env.BASE_URL}/documents`,

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

  secretEncryptionKey,

  googleCalendar: {
    clientId: googleCalendarClientId,
    clientSecret: googleCalendarClientSecret,
    redirectUri: `${process.env.BASE_URL}/auth/google/calendar/callback`,
    // Marks a signed `state` as belonging to this flow, so a token minted for anything else
    // signed with the same secret cannot be replayed into the OAuth callback.
    statePurpose: 'googleCalendarConnect',
    // Read-only on calendars, plus the email scope purely to label the stored connection with the
    // account it belongs to. Widening this list invalidates existing grants, forcing a reconnect.
    scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/userinfo.email'],
    available: !!googleCalendarClientId && !!googleCalendarClientSecret && !!secretEncryptionKey,
  },

  demoMode: process.env.DEMO_MODE === 'true',
  metricsEnabled: process.env.METRICS_ENABLED === 'true',

  positionGap: 65535,
  requiredPasswordStrength: 2,
  cacheMaxAge: 900,
  actionsLimit: 50,
};
