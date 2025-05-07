const passport = require('passport');

module.exports = {
  exits: {
    registrationDisabled: {
      responseType: 'unauthorized',
    },
    coreNotFound: {
      responseType: 'notFound',
    },
  },

  google(req, res, next) {
    passport.authenticate('google', { scope: ['email'], prompt: 'select_account' })(req, res, next);
  },

  googleCallback(req, res, next) {
    passport.authenticate('google', { failureRedirect: '/login' }, async function authenticateUser(err, profile) {
      if (err) {
        res.redirect(`${sails.config.custom.clientUrl}/google-callback?error=${err.code}`);
        return;
      }

      try {
        const user = await sails.helpers.users.getCreateOneForGoogleSso(profile.emails[0].value, profile.displayName);
        const accessToken = sails.helpers.utils.createToken(user.id);
        await Session.create({ accessToken, remoteAddress: req.connection.remoteAddress, userId: user.id, userAgent: req.headers['user-agent'] });
        res.redirect(`${sails.config.custom.clientUrl}/google-callback?accessToken=${accessToken}`);
      } catch (error) {
        res.redirect(`${sails.config.custom.clientUrl}/google-callback?error=${error.code}`);
      }
    })(req, res, next);
  },

  github(req, res, next) {
    passport.authenticate('github', { prompt: 'select_account' })(req, res, next);
  },

  githubCallback(req, res, next) {
    passport.authenticate('github', { failureRedirect: '/login' }, async function authenticateUser(err, profile) {
      if (err) {
        res.redirect(`${sails.config.custom.clientUrl}/github-callback?error=${err.code}`);
        return;
      }

      try {
        const user = await sails.helpers.users.getCreateOneForGithubSso(profile.id, profile.username, profile.displayName);
        const accessToken = sails.helpers.utils.createToken(user.id);
        await Session.create({ accessToken, remoteAddress: req.connection.remoteAddress, userId: user.id, userAgent: req.headers['user-agent'] });
        res.redirect(`${sails.config.custom.clientUrl}/github-callback?accessToken=${accessToken}`);
      } catch (error) {
        res.redirect(`${sails.config.custom.clientUrl}/github-callback?error=${error.code}`);
      }
    })(req, res, next);
  },
};
