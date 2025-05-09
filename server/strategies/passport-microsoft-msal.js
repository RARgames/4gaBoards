const { Strategy } = require('passport-strategy');
const msal = require('@azure/msal-node');

class MicrosoftMSALStrategy extends Strategy {
  constructor(options, verify) {
    super();
    this.name = 'microsoft-msal';
    this.verify = verify;
    this.redirectUri = options.callbackURL;

    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: options.clientID,
        clientSecret: options.clientSecret,
        authority: 'https://login.microsoftonline.com/common',
      },
    });

    this.scope = options.scope || ['openid', 'profile', 'email'];
  }

  authenticate(req, options) {
    if (req.query && req.query.code) {
      const tokenRequest = {
        code: req.query.code,
        scopes: this.scope,
        redirectUri: this.redirectUri,
      };

      this.msalClient
        .acquireTokenByCode(tokenRequest)
        .then((response) => {
          const profile = {
            id: response.account.homeAccountId,
            displayName: response.account.name,
            email: response.account.username,
          };

          // eslint-disable-next-line consistent-return
          this.verify(null, null, profile, (err, user) => {
            if (err) return this.error(err);
            this.success(user);
          });
        })
        .catch((err) => {
          this.error(err);
        });
    } else {
      const authCodeUrlParams = {
        scopes: this.scope,
        redirectUri: this.redirectUri,
        prompt: options.prompt,
      };

      this.msalClient
        .getAuthCodeUrl(authCodeUrlParams)
        .then((authUrl) => {
          this.redirect(authUrl);
        })
        .catch((err) => {
          this.error(err);
        });
    }
  }
}

module.exports = MicrosoftMSALStrategy;
