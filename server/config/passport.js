const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URI,
    },
    (request, accessToken, refreshToken, profile, done) => {
      // eslint-disable-next-line consistent-return
      sails.helpers.users.getOneByEmailOrUsername(profile.emails[0].value).exec((err, existingUser) => {
        if (err) {
          return done(err);
        }

        if (existingUser) {
          return done(null, existingUser);
        }

        const values = {
          isAdmin: false,
          email: profile.emails[0].value,
          isSso: true,
          name: profile.displayName || profile.emails[0].value,
          subscribeToOwnCards: false,
        };

        sails.helpers.users
          .createOne(values)
          .intercept('usernameAlreadyInUse', 'usernameAlreadyInUse')
          .exec((error, newUser) => {
            if (error) {
              return done(error);
            }

            return done(null, newUser);
          });
      });
    },
  ),
);

module.exports.passport = passport;
