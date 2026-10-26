const cron = require('node-cron');

module.exports = function defineCronExpiredSessionsCleanupHook(sails) {
  return {
    initialize(cb) {
      sails.log.info('Initializing custom hook: cron-expired-sessions-cleanup');

      const maxAgeMs = sails.config.custom.sessionsCleanupMaxAgeMs || 30 * 24 * 60 * 60 * 1000;

      cron.schedule('0 22 * * *', async () => {
        try {
          await sails.helpers.sessions.cleanup.with({ maxAgeMs });
        } catch (error) {
          sails.log.error('Sessions cleanup cron failed:', error);
        }
      });

      cb();
    },
  };
};
