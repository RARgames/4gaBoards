const cron = require('node-cron');

module.exports = function defineCronAuthRateLimitCleanupHook(sails) {
  return {
    initialize(cb) {
      sails.log.info('Initializing custom hook: cron-failed-auths-cleanup');

      const { authRateLimit } = sails.config.custom;

      if (!authRateLimit?.enabled) {
        cb();
        return;
      }

      const maxAgeMs = authRateLimit.windowMs;

      cron.schedule('*/30 * * * *', async () => {
        try {
          await sails.helpers.failedAuths.cleanup.with({ maxAgeMs });
        } catch (error) {
          sails.log.error('Failed auths cleanup cron failed:', error);
        }
      });

      cb();
    },
  };
};
