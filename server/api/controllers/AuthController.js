const passport = require('passport');

module.exports = {
  login(req, res) {
    res.view('login');
  },

  logout(req, res) {
    req.logout();
    res.redirect('/');
  },

  google(req, res, next) {
    passport.authenticate('google', { failureRedirect: '/login', scope: ['email'] })(req, res, next);
  },

  googleCallback(req, res, next) {
    passport.authenticate('google', { failureRedirect: '/login' }, async function authenticateUser(err, user) {
      if (err) {
        res.redirect(`${sails.config.custom.clientUrl}/login`);
        return null;
      }

      try {
        const accessToken = sails.helpers.utils.createToken(user.id);
        await Session.create({
          accessToken,
          remoteAddress: req.connection.remoteAddress,
          userId: user.id,
          userAgent: req.headers['user-agent'],
        });
        res.redirect(`${sails.config.custom.clientUrl}/google-callback?accessToken=${accessToken}`);
        return null;
      } catch (error) {
        res.redirect(`${sails.config.custom.clientUrl}/login`);
        return null;
      }
    })(req, res, next);
  },
};
