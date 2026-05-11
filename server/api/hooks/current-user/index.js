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
