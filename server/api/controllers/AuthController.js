module.exports = {
  exits: {
    registrationDisabled: {
      responseType: 'unauthorized',
    },
    coreNotFound: {
      responseType: 'notFound',
    },
    ssoRegistrationDisabled: {
      responseType: 'unauthorized',
    },
  },

  google(req, res, next) {
    sails.config.passport.authenticate('google', { scope: ['email'], prompt: 'select_account' })(req, res, next);
  },

  googleCallback(req, res, next) {
    sails.config.passport.authenticate('google', { failureRedirect: '/login' }, async function authenticateUser(err, profile) {
      if (err) {
        res.redirect(`${sails.config.custom.clientUrl}/google-callback?error=${err.code}`);
        return;
      }

      try {
        const user = await sails.helpers.users.getCreateOneForGoogleSso.with({ id: profile.id, email: profile.emails[0].value, displayName: profile.displayName });
        const accessToken = sails.helpers.utils.createToken(user.id);
        await Session.create({ accessToken, remoteAddress: req.connection.remoteAddress, userId: user.id, userAgent: req.headers['user-agent'] });
        res.redirect(`${sails.config.custom.clientUrl}/google-callback?accessToken=${accessToken}`);
        sails.log.info('Google SSO: User authentication successful:', user.id, user.email, user.name, user.ssoGoogleId);
      } catch (error) {
        res.redirect(`${sails.config.custom.clientUrl}/google-callback?error=${error.code}`);
      }
    })(req, res, next);
  },

  github(req, res, next) {
    sails.config.passport.authenticate('github')(req, res, next);
  },

  githubCallback(req, res, next) {
    sails.config.passport.authenticate('github', { failureRedirect: '/login' }, async function authenticateUser(err, profile) {
      if (err) {
        res.redirect(`${sails.config.custom.clientUrl}/github-callback?error=${err.code}`);
        return;
      }

      try {
        const email = profile.emails?.find((e) => e.primary && e.verified)?.value || profile.emails?.find((e) => e.verified)?.value || null;
        const user = await sails.helpers.users.getCreateOneForGithubSso.with({ id: profile.id, username: profile.username, displayName: profile.displayName, email });
        const accessToken = sails.helpers.utils.createToken(user.id);
        await Session.create({ accessToken, remoteAddress: req.connection.remoteAddress, userId: user.id, userAgent: req.headers['user-agent'] });
        res.redirect(`${sails.config.custom.clientUrl}/github-callback?accessToken=${accessToken}`);
        sails.log.info('Github SSO: User authentication successful:', user.id, user.email, user.name, user.ssoGithubId, user.ssoGithubUsername);
      } catch (error) {
        res.redirect(`${sails.config.custom.clientUrl}/github-callback?error=${error.code}`);
      }
    })(req, res, next);
  },

  microsoft(req, res, next) {
    sails.config.passport.authenticate('microsoft-msal', { prompt: 'login' })(req, res, next);
  },

  microsoftCallback(req, res, next) {
    sails.config.passport.authenticate('microsoft-msal', { failureRedirect: '/login' }, async function authenticateUser(err, profile) {
      if (err) {
        res.redirect(`${sails.config.custom.clientUrl}/microsoft-callback?error=${err.code}`);
        return;
      }

      try {
        const user = await sails.helpers.users.getCreateOneForMicrosoftSso.with({ id: profile.id, email: profile.email, displayName: profile.displayName });
        const accessToken = sails.helpers.utils.createToken(user.id);
        await Session.create({ accessToken, remoteAddress: req.connection.remoteAddress, userId: user.id, userAgent: req.headers['user-agent'] });
        res.redirect(`${sails.config.custom.clientUrl}/microsoft-callback?accessToken=${accessToken}`);
        sails.log.info('Microsoft SSO: User authentication successful:', user.id, user.email, user.name, user.ssoMicrosoftId);
      } catch (error) {
        res.redirect(`${sails.config.custom.clientUrl}/microsoft-callback?error=${error.code}`);
      }
    })(req, res, next);
  },

  oidc(req, res, next) {
    sails.config.passport.authenticate('oidc', { failureRedirect: '/login' })(req, res, next);
  },

  oidcCallback(req, res, next) {
    sails.config.passport.authenticate('oidc', { failureRedirect: '/login' }, async function authenticateUser(err, profile) {
      if (err) {
        sails.log.error('OIDC callback error:', err);
        const errorCode = err.code || err.message || 'unknown';
        res.redirect(`${sails.config.custom.clientUrl}/oidc-callback?error=${encodeURIComponent(errorCode)}`);
        return;
      }
      if (!profile) {
        sails.log.error('OIDC callback: No profile returned');
        res.redirect(`${sails.config.custom.clientUrl}/oidc-callback?error=no_profile`);
        return;
      }

      try {
        sails.log.verbose('OIDC callback: Creating/getting user', {
          profileId: profile.id,
          email: profile.email,
          displayName: profile.displayName,
          username: profile.username,
          isAdmin: profile.isAdmin,
          emails: profile.emails,
        });
        const email = profile.email ? profile.email : profile.emails?.find((e) => e.primary && e.verified)?.email || profile.emails?.find((e) => e.verified)?.email || `${profile.id}@oidc-sso-4ga-boards.com`;
        const user = await sails.helpers.users.getCreateOneForOidcSso.with({
          id: profile.id,
          email,
          displayName: profile.displayName,
          username: profile.username,
          isAdmin: profile.isAdmin,
        });
        const accessToken = sails.helpers.utils.createToken(user.id);
        await Session.create({ accessToken, remoteAddress: req.connection.remoteAddress, userId: user.id, userAgent: req.headers['user-agent'] });
        res.redirect(`${sails.config.custom.clientUrl}/oidc-callback?accessToken=${accessToken}`);
        sails.log.info('OIDC SSO: User authentication successful:', user.id, user.email, user.name, user.ssoOidcId);
      } catch (error) {
        sails.log.error('OIDC callback: Error creating user or session', error);
        const errorCode = error.code || error.message || 'unknown';
        res.redirect(`${sails.config.custom.clientUrl}/oidc-callback?error=${encodeURIComponent(errorCode)}`);
      }
    })(req, res, next);
  },
};
