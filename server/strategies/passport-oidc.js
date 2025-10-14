/**
 * Custom OIDC (OpenID Connect) authentication strategy for Passport.js
 * Implements stateless OAuth2 authorization code flow compatible with JWT-based authentication.
 *
 * Supports any OIDC-compliant provider (Authentik, Keycloak, Auth0, Okta, etc.)
 */

const { Strategy } = require('passport-strategy');
const jwt = require('jsonwebtoken');
const { checkOidcAdminStatus } = require('../utils/checkOidcAdminStatus');
const { validateOidcUsername } = require('../utils/validateOidcUsername');

class OIDCStrategy extends Strategy {
  /**
   * Creates a new OIDC strategy instance
   * @param {Object} options - Configuration options
   * @param {string} options.authorizationURL - OIDC authorization endpoint
   * @param {string} options.tokenURL - OIDC token endpoint
   * @param {string} options.userInfoURL - OIDC userinfo endpoint
   * @param {string} options.clientID - OAuth2 client ID
   * @param {string} options.clientSecret - OAuth2 client secret
   * @param {string} options.callbackURL - Callback URL for this application
   * @param {Array<string>} [options.scope] - OAuth2 scopes (default: ['openid', 'profile', 'email'])
   * @param {Function} verify - Passport verify callback function
   */
  constructor(options, verify) {
    super();
    this.name = 'oidc';
    this.verify = verify;
    this.options = options;
    this.authorizationURL = options.authorizationURL;
    this.tokenURL = options.tokenURL;
    this.clientID = options.clientID;
    this.clientSecret = options.clientSecret;
    this.callbackURL = options.callbackURL;
    this.scope = options.scope || ['openid', 'profile', 'email'];
  }

  /**
   * Main authentication method called by Passport
   * Determines whether to initiate auth flow or handle callback
   * @param {Object} req - Express request object
   */
  authenticate(req, res, next) {
    if (req.query && req.query.code) {
      // Handle OAuth2 callback with authorization code
      this.handleCallback(req, res, next);
    } else {
      // Initiate OAuth2 authorization code flow
      this.startAuth(req, res, next);
    }
  }

  /**
   * Initiates OAuth2 authorization code flow
   * Redirects user to OIDC provider's authorization endpoint
   */
  startAuth() {
    const state = jwt.sign({ nonce: crypto.randomUUID() }, process.env.OIDC_STATE_SECRET, { expiresIn: '5m' });
    const authURL = new URL(this.authorizationURL);
    authURL.search = new URLSearchParams({
      client_id: this.clientID,
      redirect_uri: this.callbackURL,
      scope: this.scope.join(' '),
      response_type: 'code',
      state,
    });

    this.redirect(authURL.toString());
  }

  /**
   * Handles OAuth2 callback and exchanges authorization code for tokens
   * Fetches user information and passes profile to verify callback
   * @param {Object} req - Express request object containing authorization code
   */
  async handleCallback(req) {
    try {
      // Verify state signature and nonce
      if (!req.query.state) throw new Error('Missing state parameter');
      const decoded = jwt.verify(req.query.state, process.env.OIDC_STATE_SECRET);
      if (!decoded?.nonce) throw new Error('Missing nonce in state');

      // Exchange authorization code for access token
      const tokenResponse = await fetch(this.tokenURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: req.query.code,
          redirect_uri: this.callbackURL,
          client_id: this.clientID,
          client_secret: this.clientSecret,
        }),
      });
      if (!tokenResponse.ok) {
        sails.log.error('OIDC: Token endpoint error', await tokenResponse.text());
        return this.fail({ message: 'Failed to fetch token' });
      }
      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        sails.log.error('OIDC: Failed to get access token', tokenData);
        return this.fail({ message: 'Failed to get access token' });
      }

      // Get user info
      const userResponse = await fetch(this.options.userInfoURL, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      const userinfo = await userResponse.json();
      sails.log.info('OIDC: User info received:', JSON.stringify(userinfo, null, 2));

      // Convert to profile format expected by passport
      const profile = {
        id: userinfo.sub,
        displayName: userinfo.name || userinfo.preferred_username,
        username: validateOidcUsername(userinfo.preferred_username) || validateOidcUsername(userinfo.nickname) || null,
        emails: [{ value: userinfo.email }],
        name: {
          givenName: userinfo.given_name,
          familyName: userinfo.family_name,
        },
        isAdmin: checkOidcAdminStatus(userinfo),
      };
      sails.log.info('OIDC: Profile created', { id: profile.id, username: profile.username, isAdmin: profile.isAdmin, detectedFromGroups: userinfo.groups });

      // Call verify callback with profile
      this.verify(tokenData.access_token, tokenData.refresh_token, profile, (err, user) => {
        if (err) {
          sails.log.error('OIDC: Verify callback error', err);
          return this.fail(err);
        }
        sails.log.info('OIDC: Authentication successful', { userId: user?.id });
        this.success(user);
        return null;
      });
      return null;
    } catch (error) {
      sails.log.error('OIDC: Authentication error', error);
      this.fail({ message: error.message || 'Authentication failed' });
      return null;
    }
  }
}

module.exports = OIDCStrategy;
