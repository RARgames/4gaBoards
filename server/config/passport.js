const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const GitHubStrategy = require('passport-github');
const MicrosoftMSALStrategy = require('../strategies/passport-microsoft-msal');

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
      (accessToken, refreshToken, profile, done) => done(null, profile),
    ),
  );
}

module.exports.passport = passport;
