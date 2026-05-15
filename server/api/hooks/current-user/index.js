/**
 * current-user hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineCurrentUserHook(sails) {
  const TOKEN_PATTERN = /^Bearer /;

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook: current-user');
    },

    routes: {
      before: {
        '/api/*': {
          async fn(req, res, next) {
            const { authorization: authorizationHeader } = req.headers;

            if (authorizationHeader && TOKEN_PATTERN.test(authorizationHeader)) {
              const accessToken = authorizationHeader.replace(TOKEN_PATTERN, '');
              const currentUser = await sails.helpers.utils.getUser(accessToken);

              if (currentUser) {
                Object.assign(req, {
                  accessToken,
                  currentUser,
                });

                // Set cookie so <img> tags on the same origin can authenticate
                // Fixes issue where uploaded attachment images render as black
                // https://github.com/RARgames/4gaBoards/issues/27
                if (!req.cookies || req.cookies.accessToken !== accessToken) {
                  res.cookie('accessToken', accessToken, {
                    maxAge: 365 * 24 * 60 * 60 * 1000,
                    httpOnly: false,
                    sameSite: 'lax',
                    path: '/',
                  });
                }

                if (req.isSocket) {
                  sails.sockets.join(req, `@user:${currentUser.id}`);
                }
              }
            }

            return next();
          },
        },
        '/attachments/*': {
          async fn(req, res, next) {
            const { accessToken } = req.cookies;

            if (accessToken) {
              const currentUser = await sails.helpers.utils.getUser(accessToken);

              if (currentUser) {
                Object.assign(req, {
                  accessToken,
                  currentUser,
                });
              }
            }

            return next();
          },
        },
        '/exports/*': {
          async fn(req, res, next) {
            const { accessToken } = req.cookies;

            if (accessToken) {
              const currentUser = await sails.helpers.utils.getUser(accessToken);

              if (currentUser) {
                Object.assign(req, {
                  accessToken,
                  currentUser,
                });
              }
            }

            return next();
          },
        },
      },
    },
  };
};
