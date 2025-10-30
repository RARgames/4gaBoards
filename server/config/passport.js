const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const GitHubStrategy = require('@rargames/passport-github');
const MicrosoftMSALStrategy = require('../strategies/passport-microsoft-msal');
const OIDCStrategy = require('../strategies/passport-oidc');
const { fetchRetryUntilAvailable } = require('../utils/fetchRetry');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      },
      (request, accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      },
    ),
  );
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
        scope: ['user:email'],
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      },
    ),
  );
}
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftMSALStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/microsoft/callback`,
        scope: ['openid', 'profile', 'email'],
      },
      (accessToken, refreshToken, profile, done) => {
        done(null, profile);
      },
    ),
  );
}
async function setupOIDC() {
  if (!process.env.OIDC_CLIENT_ID || !process.env.OIDC_CLIENT_SECRET || !process.env.OIDC_STATE_SECRET) {
    return;
  }

  // Try to read OpenID config from .well-known/openid-configuration if not all URLs are provided
  let authorizationURL = process.env.OIDC_AUTH_URL;
  let tokenURL = process.env.OIDC_TOKEN_URL;
  let userInfoURL = process.env.OIDC_USERINFO_URL;

  if (!authorizationURL || !tokenURL || !userInfoURL) {
    const issuerBase = process.env.OIDC_ISSUER_URL;
    if (!issuerBase) {
      sails.log.warn('OIDC: OIDC_ISSUER_URL is not set, cannot fetch OpenID configuration');
      return;
    }

    const wellKnownUrl = `${issuerBase.replace(/\/$/, '')}/.well-known/openid-configuration`;
    try {
      sails.log.info(`OIDC: Fetching OpenID configuration from ${wellKnownUrl}`);
      const res = await fetchRetryUntilAvailable(wellKnownUrl, {}, 4000);
      const config = await res.json();

      sails.log.info(`OIDC: OpenID configuration fetched successfully: authorizationURL: ${config.authorization_endpoint}, tokenURL: ${config.token_endpoint}, userInfoURL: ${config.userinfo_endpoint}`);
      authorizationURL = authorizationURL || config.authorization_endpoint;
      tokenURL = tokenURL || config.token_endpoint;
      userInfoURL = userInfoURL || config.userinfo_endpoint;
    } catch (err) {
      sails.log.error('OIDC: Failed to fetch OpenID configuration', err);
    }
  }

  if (authorizationURL && tokenURL && userInfoURL) {
    passport.use(
      'oidc',
      new OIDCStrategy(
        {
          authorizationURL,
          tokenURL,
          userInfoURL,
          clientID: process.env.OIDC_CLIENT_ID,
          clientSecret: process.env.OIDC_CLIENT_SECRET,
          callbackURL: `${process.env.BASE_URL}/auth/oidc/callback`,
          scope: ['openid', 'profile', 'email'],
        },
        (accessToken, refreshToken, profile, done) => {
          return done(null, profile);
        },
      ),
    );
    sails.config.custom.ssoAvailable.oidc = true;
  }
  sails.config.passport = passport;
}

module.exports = {
  passport,
  setupOIDC,
};
