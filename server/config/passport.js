const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
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
          ssoGoogleEmail: profile.emails[0].value,
          name: profile.displayName || profile.emails[0].value.split('@')[0],
          username: profile.displayName || profile.emails[0].value.split('@')[0],
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
