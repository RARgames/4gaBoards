const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      },
      (request, accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        // eslint-disable-next-line consistent-return
        sails.helpers.users.getCreateOneForSso(email, profile.displayName).exec((err, user) => {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, user);
          }
        });
      },
    ),
  );
}
module.exports.passport = passport;
