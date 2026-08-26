/**
 * Custom OIDC (OpenID Connect) authentication strategy for Passport.js
 * Implements stateless OAuth2 authorization code flow compatible with JWT-based authentication.
 *
 * Supports any OIDC-compliant provider (Authentik, Keycloak, Auth0, Okta, etc.)
 */

const crypto = require('crypto');
const { Strategy } = require('passport-strategy');

const { checkOidcAdminStatus } = require('../utils/checkOidcAdminStatus');
const { validateOidcUsername } = require('../utils/validateOidcUsername');

const createCodeVerifier = () => crypto.randomBytes(32).toString('base64url');
const createCodeChallenge = (codeVerifier) => crypto.createHash('sha256').update(codeVerifier).digest('base64url');
const getStateEncryptionKey = () => crypto.createHash('sha256').update(process.env.OIDC_STATE_SECRET).digest();

async function createOidcState(codeVerifier) {
  const { EncryptJWT } = await import('jose');
  return new EncryptJWT({
    nonce: crypto.randomUUID(),
    ...(codeVerifier && { codeVerifier }),
  })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .encrypt(getStateEncryptionKey());
}

async function readOidcState(state) {
  const { jwtDecrypt } = await import('jose');
  const { payload, protectedHeader } = await jwtDecrypt(state, getStateEncryptionKey());
  if (protectedHeader.alg !== 'dir' || protectedHeader.enc !== 'A256GCM' || !payload.nonce) {
    throw new Error('Invalid state parameter');
  }
  return payload;
}

class OIDCStrategy extends Strategy {
  /**
   * Creates a new OIDC strategy instance
   * @param {Object} options - Configuration options
   * @param {string} options.authorizationURL - OIDC authorization endpoint
   * @param {string} options.tokenURL - OIDC token endpoint
   * @param {string} options.userInfoURL - OIDC userinfo endpoint
   * @param {string} options.clientID - OAuth2 client ID
   * @param {string} [options.clientSecret] - OAuth2 client secret
   * @param {string} options.callbackURL - Callback URL for this application
   * @param {boolean} [options.pkceEnabled] - Enable PKCE (S256)
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
    this.userInfoURL = options.userInfoURL;
    this.clientID = options.clientID;
    this.clientSecret = options.clientSecret;
    this.callbackURL = options.callbackURL;
    this.pkceEnabled = options.pkceEnabled;
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
      return this.handleCallback(req, res, next);
    } else {
      // Initiate OAuth2 authorization code flow
      return this.startAuth(req, res, next).catch((error) => this.error(error));
    }
  }

  /**
   * Initiates OAuth2 authorization code flow
   * Redirects user to OIDC provider's authorization endpoint
   */
  async startAuth(req) {
    const hint = req?.query?.kc_idp_hint;
    if (hint) {
      const disabledEnvVar = `OIDC_DISABLE_HINT_${hint.toUpperCase()}`;
      if (process.env[disabledEnvVar] === 'true') {
        return this.fail({ message: `${hint} login is disabled` });
      }
    }

    const codeVerifier = this.pkceEnabled ? createCodeVerifier() : undefined;
    const state = await createOidcState(codeVerifier);
    const authURL = new URL(this.authorizationURL);
    authURL.search = new URLSearchParams({
      client_id: this.clientID,
      redirect_uri: this.callbackURL,
      scope: this.scope.join(' '),
      response_type: 'code',
      state,
      ...(codeVerifier && { code_challenge: createCodeChallenge(codeVerifier), code_challenge_method: 'S256' }),
      ...(hint && { kc_idp_hint: hint }),
      ...(hint === 'google' && !(process.env.OIDC_SKIP_ACCOUNT_SELECTION === 'true' || process.env[`OIDC_SKIP_ACCOUNT_SELECTION_HINT_${hint.toUpperCase()}`] === 'true') && { prompt: 'select_account' }),
      ...(hint === 'microsoft' && !(process.env.OIDC_SKIP_ACCOUNT_SELECTION === 'true' || process.env[`OIDC_SKIP_ACCOUNT_SELECTION_HINT_${hint.toUpperCase()}`] === 'true') && { prompt: 'login' }),
      ...(hint === 'github' && !(process.env.OIDC_SKIP_ACCOUNT_SELECTION === 'true' || process.env[`OIDC_SKIP_ACCOUNT_SELECTION_HINT_${hint.toUpperCase()}`] === 'true') && { prompt: 'select_account' }),
    });
    return this.redirect(authURL.toString());
  }

  /**
   * Handles OAuth2 callback and exchanges authorization code for tokens
   * Fetches user information and passes profile to verify callback
   * @param {Object} req - Express request object containing authorization code
   */
  async handleCallback(req) {
    try {
      // Verify and decrypt the state. It contains the PKCE verifier when enabled.
      if (!req.query.state) throw new Error('Missing state parameter');
      const state = await readOidcState(req.query.state);
      if (this.pkceEnabled && !state.codeVerifier) throw new Error('Missing PKCE verifier in state');
      // FUTURE verify nonce

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
          ...(this.clientSecret && { client_secret: this.clientSecret }),
          ...(this.pkceEnabled && { code_verifier: state.codeVerifier }),
        }),
      });
      if (!tokenResponse.ok) {
        sails.log.error('OIDC: Token endpoint error', await tokenResponse.text());
        return this.fail({ message: 'Failed to fetch token' });
      }
      let tokenData;
      const contentType = tokenResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        tokenData = await tokenResponse.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const body = await tokenResponse.text();
        tokenData = Object.fromEntries(new URLSearchParams(body));
      } else {
        throw new Error(`Unexpected content-type: ${contentType}`);
      }
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
      sails.log.verbose('OIDC: User info received:', JSON.stringify(userinfo, null, 2));

      // Convert to profile format expected by passport
      const profile = {
        id: userinfo.sub || userinfo.id,
        email: userinfo.email,
        displayName: userinfo.name || userinfo.preferred_username,
        username: validateOidcUsername(userinfo.preferred_username) || validateOidcUsername(userinfo.nickname) || null,
        isAdmin: checkOidcAdminStatus(userinfo),
        emails: userinfo.emails,
      };
      sails.log.verbose('OIDC: Profile created', { id: profile.id, username: profile.username, isAdmin: profile.isAdmin, detectedFromGroups: userinfo.groups });

      // Call verify callback with profile
      this.verify(tokenData.access_token, tokenData.refresh_token, profile, (err, user) => {
        if (err) {
          sails.log.error('OIDC: Verify callback error', err);
          return this.fail(err);
        }
        sails.log.verbose('OIDC: Authentication successful', { userId: user?.id });
        return this.success(user);
      });
      return null;
    } catch (error) {
      sails.log.error('OIDC: Authentication error', error);
      return this.fail({ message: error.message || 'Authentication failed' });
    }
  }
}

module.exports = OIDCStrategy;
